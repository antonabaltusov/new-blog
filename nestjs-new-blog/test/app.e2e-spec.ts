import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UseGuards } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsEntity } from '../src/news/news.entity';
import { CommentsEntity } from '../src/news/comments/comments.entity';
import { UsersEntity } from '../src/users/users.entity';
import { Role } from '../src/auth/role/role.enum';
import { Connection } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockNewsRepository = {};
  const mockUseGuards = {};
  const mockCommentsRepository = {};
  const mockUsers = [
    {
      id: 1,
      firstName: 'Dima',
      email: 'mail@mail.ru',
      password: 'dcfdvsdfv',
      roles: Role.User,
      avatar: 'img.png',
      createdAt: 2,
      updatedAt: 3,
    },
  ];

  const mockUsersRepository = {
    create: jest.fn().mockImplementation((dto) => {
      const user = {
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...dto,
      };
      mockUsers.push(user);
      return user;
    }),
    save: jest.fn().mockImplementation((user) =>
      Promise.resolve({
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...user,
      }),
    ),

    find: jest.fn().mockImplementation((options?) => {
      let answer = [...mockUsers];
      if (options.where) {
        for (const key in options.where) {
          const _answer = answer.map((user) => {
            if (user[key] === options.where[key]) {
              return user;
            }
          });
          answer = [..._answer];
        }
      }
      return Promise.resolve(answer);
    }),

    findOne: jest.fn().mockImplementation((id) => {
      return Promise.resolve({
        ...mockUsers.find((user) => user.id === id),
      });
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(NewsEntity))
      .useValue(mockNewsRepository)
      .overrideProvider(getRepositoryToken(CommentsEntity))
      .useValue(mockCommentsRepository)
      .overrideProvider(getRepositoryToken(UsersEntity))
      .useValue(mockUsersRepository)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    const connection = app.get(Connection);
    await connection.synchronize(true);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // describe('Authentication', () => {
  //   let jwtToken: string;
  //   const newUser = {
  //     firstName: 'Dima',
  //     email: 'new@mail.ru',
  //     password: '1',
  //   };

  //   describe('AuthModule', () => {
  //     // assume test data includes user test@example.com with password 'password'
  //     it('create user', async () => {
  //       const response = await request(app.getHttpServer())
  //         .post('/users/api')
  //         .send(newUser)
  //         .expect(201);

  //       console.log(response.body);
  //     });

  //     it('authenticates user with valid credentials and provides a jwt token', async () => {
  //       const response = await request(app.getHttpServer())
  //         .post('/auth/login')
  //         .send({ username: mockUsers[0].email, password: mockUsers[0].password })
  //         .expect(201);
  //       // set jwt token for use in subsequent tests
  //       jwtToken = response.body.accessToken
  //       expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/) // jwt regex
  //     });

  //     it('fails to authenticate user with an incorrect password', async () => {
  //       const response = await request(app.getHttpServer())
  //         .post('/auth/login')
  //         .send({ email: 'test@example.com', password: 'wrong' })
  //         .expect(401);

  //       expect(response.body.accessToken).not.toBeDefined()
  //     });

  //     // assume test data does not include a nobody@example.com user
  //     it('fails to authenticate user that does not exist', async () => {
  //       const response = await request(app.getHttpServer())
  //         .post('/auth/login')
  //         .send({ email: 'nobody@example.com', password: 'test' })
  //         .expect(401);

  //       expect(response.body.accessToken).not.toBeDefined()
  //     });
  //   });

  //   describe('Protected', () => {
  //     it('gets protected resource with jwt authenticated request', async () => {
  //       const response = await request(app.getHttpServer())
  //         .get('/protected')
  //         .set('Authorization', `Bearer ${jwtToken}`)
  //         .expect(200);

  //       const data = response.body.data;
  //       // add assertions that reflect your test data
  //       // expect(data).toHaveLength(3) 
  //     });
  //   });
  // });
  // it('/auth (GET)', () => {
  //   return request(app.getHttpServer())
  //     .post('/auth/login')
  //     .auth('sims@gmail.com', '1')
  //     .expect(201);
  // });
});
