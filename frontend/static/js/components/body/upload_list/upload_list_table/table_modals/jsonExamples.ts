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
