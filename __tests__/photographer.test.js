const request = require('supertest');
const app = require('../app');

describe('Test the photographer API', () => {
  let token;
  let id;
  let photos;
  beforeAll((done) => {
    request(app).post('/login')
    .send({ email: 'teste11@teste11.com', password: 'teste11' }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      id = res.body.userId;
      token = res.body.token;
      done();
    });
  });

  test('photographer obtained from server ', (done) => {
    request(app).get(`/api/photographer/${id}`)
    .set('Authorization', `bearer ${token}`)
    .then((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body.password).not.toBeDefined();
      done();
    });
  });

  test('photographer not obtained from server if wrong token', (done) => {
    request(app).get(`/api/photographer/${id}`)
    .set('Authorization', `bearer 000`)
    .then((res) => {
      expect(res.statusCode).toBe(401);

      done();
    });
  });

  test('photographer updates ok', (done) => {
    request(app).put(`/api/photographer/${id}`)
    .set('Authorization', `bearer ${token}`)
    .send({
      Biography: "testing if it can be updated"
    }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(201);
      done();
    });

    request(app).put(`/api/photographer/${id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        Biography: "kkkkk"
      }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(201);
      done();
    });
  });

  test('dont update to invalid or keep blank required fields', (done) => {
    request(app).put(`/api/photographer/${id}`)
    .set('Authorization', `bearer ${token}`)
    .send({
      Email: "test"
    }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(500);
      expect(res.body.name).toMatch("SequelizeValidationError");
    });

    request(app).put(`/api/photographer/${id}`)
    .set('Authorization', `bearer ${token}`)
    .send({
      Name: ""
    }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(500);
      done();
    });
  });

  test('create new user', (done) => {
    request(app).post(`/api/photographer`)
    .send({
      name: "xis",
      email: "teste22@teste22.com",
      password: "teste22",
      skill: "Professional",
      biography: "kkkkk",
      webpage: "kk",
      facebook: "kk",
      instagram: "kk",
      pictUrl: "http://teste.com",
      city: "Belo Horizonte",
      country: "Brazil"
    })
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(201);
      done();
    });
  });

   describe('delete created user', () => {
    let id2;
    let token2;
    beforeAll((done) => {
      request(app).post('/login')
      .send({ email: 'teste22@teste22.com', password: 'teste22' })
      .set('Content-Type', 'application/json')
      .then((res) => {
        id2 = res.body.userId;
        token2 = res.body.token;
        done();
      });


    });


    test( "del", (done) => {
      jest.setTimeout(30000);
      request(app).delete(`/api/photographer/${id2}`)
      .set('Authorization', `bearer ${token2}`)
      .set('Content-Type', 'application/json')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        done();
      });
    });

  });

  test('add new photos links', (done) => {
    request(app).post(`/api/photographer/${id}/photos`)
    .set('Authorization', `bearer ${token}`)
    .send({
      photos: [
      {
        photographerId: id,
        cloudlink: "html://teste1"
      },
      {
        photographerId: id,
        cloudlink: "html://teste2"
      },
      ]
    }) //ensure user is registered before this test
    .set('Content-Type', 'application/json')
    .then((res) => {
      expect(res.statusCode).toBe(201);
      expect(res.body.length).toBe(2);
      photos = res.body;
      done();
    });
  });

  test( "del photos", (done) => {
    jest.setTimeout(30000);

    request(app).delete(`/api/photographer/${id}/photos`)
    .set('Authorization', `bearer ${token}`)
    .send({
      photoIds: photos.map(i => i.id)
    })
    .set('Content-Type', 'application/json')

    .then((res) => {
      expect(res.body.msg).toMatch('2 photos deleted from database successfully')
      done();
    });
  });



});