require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('post /todo creates new todo', async () => {
      await fakeRequest(app).post('/api/todos');
      const newTodo = {
        todo:'feed cats',
        completed:false,
      };
      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send(newTodo)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body.todo).toEqual(newTodo.todo);
      expect(data.body.id).toBeGreaterThan(0);
      
    });

    test('returns todos', async() => {

      const expectation = [
        {
          'id': 4,
          'todo' : 'feed cats',
          'completed' : false,
          'user_id':3
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      
    });


    
    test('put /api/todos/:id updates todo', async () => {
      const updatedTodo = {
        todo: 'wash clothes',
        completed: true,
      };
      const data = await fakeRequest(app)
        .put('/api/todos/3')
        .set('Authorization', token)
        .send(updatedTodo)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body.completed).toEqual(updatedTodo.completed);
    }, 10000);


  });
});
