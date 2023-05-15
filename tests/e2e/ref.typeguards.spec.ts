import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import {
  isDocument,
  isDocumentArray,
  isRefType,
  isRefTypeArray,
  MongooseModule,
} from '../../lib';

import { PersonModule } from '../src/person/person.module';
import { PersonService } from '../src/person/person.service';
import { StoryModule } from '../src/story/story.module';
import { StoryService } from '../src/story/story.service';
import { UserModule } from '../src/user/user.module';
import { UserService } from '../src/user/user.service';

describe('Ref Typeguards', () => {
  let app: INestApplication;
  let personService: PersonService;
  let storyService: StoryService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test'),
        PersonModule,
        StoryModule,
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    personService = module.get<PersonService>(PersonService);
    storyService = module.get<StoryService>(StoryService);
    userService = module.get<UserService>(UserService);
    await app.init();
  });

  afterEach(async () => {
    await personService.model.deleteMany();
    await storyService.model.deleteMany();
    await userService.model.deleteMany();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(personService).toBeDefined();
    expect(storyService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('should pass the check for single document after population', async () => {
    const master = await userService.model.create({
      name: 'master',
    });

    const sub = await userService.model.create({
      master: master._id,
      name: 'sub',
    });

    await sub.populate('master');

    if (isDocument(sub.master)) {
      expect(sub.master).not.toBeInstanceOf(Types.ObjectId);
      expect(sub.master).toBeInstanceOf(userService.model);
      expect(sub.master.name).toStrictEqual(master.name); // typescript types work well
    } else {
      throw new Error("'sub.master' isn't document");
    }
  });

  it('should pass the check for array of documents after population', async () => {
    const sub = await userService.model.create({
      name: 'sub',
    });

    const master = await userService.model.create({
      name: 'master',
      subs: [sub._id],
    });

    await master.populate('subs');

    if (isDocumentArray(master.subs)) {
      expect(Array.isArray(master.subs)).toStrictEqual(true);
      expect(master.subs).toHaveLength(1);
      expect(master.subs.at(0)).not.toBeInstanceOf(Types.ObjectId);
      expect(master.subs.at(0)).toBeInstanceOf(userService.model);
      expect(master.subs.at(0)?.name).toStrictEqual(sub.name); // typescript types work well
    } else {
      throw new Error("'master.subs' isn't array of documents");
    }
  });

  it('should pass the check for array of documents after population (mongoose.Types.Array<Ref<T>>)', async () => {
    const sub = await userService.model.create({
      name: 'sub',
    });

    const master = await userService.model.create({
      name: 'master',
      susp: [sub._id],
    });

    await master.populate('susp');

    if (isDocumentArray(master.susp)) {
      expect(Array.isArray(master.susp)).toStrictEqual(true);
      expect(master.susp).toHaveLength(1);
      expect(master.susp.at(0)).not.toBeInstanceOf(Types.ObjectId);
      expect(master.susp.at(0)).toBeInstanceOf(userService.model);
      expect(master.susp.at(0)?.name).toStrictEqual(sub.name); // typescript types work well
    } else {
      throw new Error("'master.susp' isn't array of documents");
    }
  });

  it('should pass the check for single document after depopulation', async () => {
    const master = await userService.model.create({
      name: 'master',
    });

    const sub = await userService.model.create({
      master: master,
      name: 'sub',
    });

    sub.depopulate('master');

    if (!isDocument(sub.master)) {
      // ts error (as expected):
      // property 'name' does not exist on type 'ObjectId'
      // sub.master.name
      expect(sub.master).not.toHaveProperty('name');
      expect(sub.master).toBeInstanceOf(Types.ObjectId);
      expect(sub.master).not.toBeInstanceOf(userService.model);
    } else {
      throw new Error("'sub.master' is document");
    }
  });

  it('should pass the check for array of documents after depopulation', async () => {
    const sub = await userService.model.create({
      name: 'sub',
    });

    const master = await userService.model.create({
      name: 'master',
      subs: [sub],
    });

    master.depopulate('subs');

    if (!isDocumentArray(master.subs)) {
      // ts error (as expected):
      // property 'name' does not exist on type 'ObjectId'
      // master.subs.at(0)?.name
      expect(Array.isArray(master.subs)).toStrictEqual(true);
      expect(master.subs).toHaveLength(1);
      expect(master.subs.at(0)).not.toHaveProperty('name');
      expect(master.subs.at(0)).toBeInstanceOf(Types.ObjectId);
      expect(master.subs.at(0)).not.toBeInstanceOf(userService.model);
    } else {
      throw new Error("'master.subs' is array of documents");
    }
  });

  it('should pass the check for array of documents after depopulation (mongoose.Types.Array<Ref<T>>)', async () => {
    const sub = await userService.model.create({
      name: 'sub',
    });

    const master = await userService.model.create({
      name: 'master',
      susp: [sub],
    });

    master.depopulate('susp');

    if (!isDocumentArray(master.susp)) {
      // ts error (as expected):
      // property 'name' does not exist on type 'ObjectId'
      // master.susp.at(0)?.name
      expect(Array.isArray(master.susp)).toStrictEqual(true);
      expect(master.susp).toHaveLength(1);
      expect(master.susp.at(0)).not.toHaveProperty('name');
      expect(master.susp.at(0)).toBeInstanceOf(Types.ObjectId);
      expect(master.susp.at(0)).not.toBeInstanceOf(userService.model);
    } else {
      throw new Error("'master.susp' is array of documents");
    }
  });

  it('should pass the checks after population across multiple levels', async () => {
    const user1 = await userService.model.create({
      name: 'user-1',
    });

    const user2 = await userService.model.create({
      name: 'user-2',
      master: user1._id,
    });

    const user3 = await userService.model.create({
      name: 'user-3',
      master: user2._id,
    });

    await user3.populate('master');

    if (isDocument(user3.master)) {
      // user3.master => user2
      await user3.master.populate('master');

      if (isDocument(user3.master.master)) {
        // user3.master.master => user1
        expect(user3.master.master).not.toBeInstanceOf(Types.ObjectId);
        expect(user3.master.master).toBeInstanceOf(userService.model);
        expect(user3.master.master.name).toStrictEqual(user1.name);
      } else {
        throw new Error("'user3.master.master' isn't document");
      }
    } else {
      throw new Error("'user3.master' isn't document");
    }
  });

  it('should pass the ref type check (ObjectId)', async () => {
    const master = await userService.model.create({
      name: 'master',
    });

    const sub = await userService.model.create({
      name: 'sub',
      master,
    });

    expect(isRefType(sub.master, Types.ObjectId)).toStrictEqual(false);
    sub.depopulate('master');

    if (isRefType(sub.master, Types.ObjectId)) {
      // (property) master?: Types.ObjectId
      expect(sub.master).toBeInstanceOf(Types.ObjectId);
    } else {
      throw new Error("'sub.master' isn't ref type of ObjectId");
    }
  });

  it('should pass the ref type check (string)', async () => {
    const leo = await personService.model.create({
      _id: 'f662eaa1-912a-4789-a4ef-ebc6b6541b9d',
      age: 82,
      name: 'Leo Tolstoy',
    });

    const story = await storyService.model.create({
      author: leo,
      title: 'After the Ball',
    });

    expect(isRefType(story.author, String)).toStrictEqual(false);
    story.depopulate('author');

    if (isRefType(story.author, String)) {
      // (property) author: string
      expect(typeof story.author).toBe('string');
    } else {
      throw new Error("'story.author' isn't ref type of string");
    }
  });

  it('should pass the ref type check (ObjectId[])', async () => {
    const sub = await userService.model.create({
      name: 'sub',
    });

    const master = await userService.model.create({
      name: 'master',
      subs: [sub],
    });

    expect(isRefTypeArray(master.subs, Types.ObjectId)).toStrictEqual(false);
    master.depopulate('subs');

    if (isRefTypeArray(master.subs, Types.ObjectId)) {
      expect(Array.isArray(master.subs)).toStrictEqual(true);
      expect(master.subs).toHaveLength(1);
      expect(master.subs.at(0)).toBeInstanceOf(Types.ObjectId);
    } else {
      throw new Error("'master.subs' isn't ref type of array of ObjectIds");
    }
  });

  it('should pass the ref type check (string[])', async () => {
    const leo = await personService.model.create({
      _id: 'f662eaa1-912a-4789-a4ef-ebc6b6541b9d',
      age: 82,
      name: 'Leo Tolstoy',
    });

    const notna = await personService.model.create({
      _id: '2cd7fdd2-7b41-4796-9dcb-7aef8e007e9c',
      age: 25,
      name: 'Notna Nek',
    });

    const yerdna = await personService.model.create({
      _id: '229a910b-0ab5-4df7-9523-26677d3028cb',
      age: 35,
      name: 'Yerdna Stebok',
    });

    const story = await storyService.model.create({
      author: leo,
      title: 'After the Ball',
      fans: [notna, yerdna],
    });

    expect(isRefTypeArray(story.fans, String)).toStrictEqual(false);
    story.depopulate('fans');

    if (isRefTypeArray(story.fans, String)) {
      expect(Array.isArray(story.fans)).toStrictEqual(true);
      expect(story.fans).toHaveLength(2);
      expect(typeof story.fans.at(0)).toBe('string');
      expect(typeof story.fans.at(1)).toBe('string');
    } else {
      throw new Error("'story.fans' isn't ref type of array of strings");
    }
  });
});
