export const jsonFirstExample = `
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough",
      "zipcode": "92998-3874",
    }
  },
  {
    "id": 2,
    "name": "Ervin Howell",
    "username": "Antonette",
    "email": "Shanna@melissa.tv",
    "address": {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
    }
  },
  ...
]
`;

export const jsonSecondExample = `
{
  "count": 100, 
  "next": "https://random/api/?page=2", 
  "previous": null, 
  "results": [
    {
      "gender": "male",
      "name": {
        "title": "Mr",
        "first": "Babür",
        "last": "Avan"
      }
    },
    {
      "gender": "female",
      "name": {
        "title": "Ms",
        "first": "Giulia",
        "last": "de Souza"
      },
    },
    ...
    ]
}
`;

export const jsonThirdExample = `
{
  "results": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "address": {
          "street": "Flower Street",
          "city": "New York"
        }
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "address": {
          "street": "Sunny Avenue",
          "city": "Los Angeles"
        }
      },
      ...
    ],
    "additionalInfo": "Sample nested data"
  },
  "status": "success"
}
`;

export const jsonFlattenFirstExample = `
[
  {
    "name": "John",
    "age": 30,
    "email": "john@example.com",
    "is_subscribed": true
  },
  {
    "name": "Jane",
    "age": 25,
    "email": "jane@example.com",
    "is_subscribed": false
  },
  ...
]
`;

export const jsonFlattenSecondExample = `
[
  {
    "name": "John",
    "age": 30,
    "email": "john@example.com",
    "is_subscribed": true,
    "address": {
      "city": "New York",
      "zip": "10001"
    }
  },
  {
    "name": "Jane",
    "age": 25,
    "email": "jane@example.com",
    "is_subscribed": false,
    "address": {
      "city": "San Francisco",
      "zip": "94101"
    }
  },
  ...
]
`;

export const jsonFlattenThirdExample = `
[
  {
    "name": "John",
    "age": 30,
    "email": "john@example.com",
    "is_subscribed": true,
    "address": {
      "city": "New York",
      "zip": "10001",
      "coordinates": {
        "lat": 40.7128,
        "lon": -74.0060
      }
    }
  },
  {
    "name": "Jane",
    "age": 25,
    "email": "jane@example.com",
    "is_subscribed": false,
    "address": {
      "city": "San Francisco",
      "zip": "94101",
      "coordinates": {
        "lat": 37.7749,
        "lon": -122.4194
      }
    }
  },
  ...
]
`;
