const request = require('supertest');
const BASE_URL = 'https://petstore.swagger.io/v2';
const petId = Math.floor(Math.random() * 999999);
const petName = "Buster";

describe('Petstore API - Complete Lifecycle', () => {
    // Generate a unique ID for this specific test run


    // 1. POST (Functional)
    it('POST /pet - should create a new pet', async () => {
        const response = await request(BASE_URL)
            .post('/pet')
            .send({ id: petId, name: petName, status: "available" });

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(petId);
    });

    // 2. GET (Functional - Path Parameter)
    it('GET /pet/{petId} - should retrieve the pet', async () => {
        const response = await request(BASE_URL).get(`/pet/${petId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe(petName);
    });

    // 3. PUT (Functional - Update data)
    it('PUT /pet - should update pet name', async () => {
        const response = await request(BASE_URL)
            .put('/pet')
            .send({ id: petId, name: "BusterV2", status: "sold" });

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("BusterV2");
    });

    // 4. GET (Query Parameter)
    it('GET /pet/findByStatus - should find pets by status', async () => {
        const response = await request(BASE_URL)
            .get('/pet/findByStatus')
            .query({ status: 'sold' }); // Demonstrating Query Parameter

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // 5. DELETE (Functional)
    it('DELETE /pet/{petId} - should remove the pet', async () => {
        const response = await request(BASE_URL).delete(`/pet/${petId}`);
        expect(response.statusCode).toBe(200);
    });
});

describe('Petstore API - Negative & Edge Cases', () => {
    // Negative Test: Invalid ID
    it('GET /pet/{petId} - should return 404 for non-existent ID', async () => {
        const response = await request(BASE_URL).get('/pet/9999999999');
        expect(response.statusCode).toBe(404);
    });

    // Edge Case: Empty Body on POST
    it('POST /pet - should handle empty request body', async () => {
        const response = await request(BASE_URL)
            .post('/pet')
            .send({}); // Sending nothing

        //Swagger Petstore returns 200 with no data.
        expect(response.statusCode).not.toBe(500);
    });

    it('POST /pet - invalid id', async () => {
        const response = await request(BASE_URL)
            .post('/pet')
            .send({ id: "kajsfgioj", name: petName, status: "available" });

        expect(response.statusCode).toBe(500);
        expect(response.body.type).toBe("unknown");
        expect(response.body.message).toBe("something bad happened");
    });

    it('POST /pet - should handle extremely long names (Boundary)', async () => {
        const longName = "akad".repeat(1000) + "piowrgn".repeat(5000);
        const response = await request(BASE_URL)
            .post('/pet')
            .send({ id: petId, name: longName });
        // Limit missing for name.
        expect(response.statusCode).not.toBe(500);
        if (response.statusCode === 200) {
            console.log(`API accepted a name of length: ${response.body.name.length}`);
        }
    });

    // Test for the Accept header crash
    it('GET /pet/{id} - should return 500 when requesting text/plain (Bug Found)', async () => {
        const response = await request(BASE_URL)
            .get('/pet/12345')
            .set('Accept', 'text/plain');

        expect(response.statusCode).toBe(500);
        // We can even check if the response is HTML instead of JSON
        expect(response.text).toContain('HTTP ERROR 500');
    });

    // Test for the Injection/Invalid ID
    it('GET /pet/{id} - should return 404 and Java error for invalid ID string', async () => {
        const response = await request(BASE_URL)
            .get('/pet/123 OR 1=1');

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toContain('NumberFormatException');
    });

    it('DELETE /pet - should handle invalid ID format (Type Mismatch)', async () => {
        const response = await request(BASE_URL)
            .delete('/pet/abc-invalid-id');

        expect(response.statusCode).toBe(404);
    });

});