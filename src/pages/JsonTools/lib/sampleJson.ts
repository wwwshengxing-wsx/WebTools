export const sampleJson = `{
  "finance": {
    "currency": "MYR",
    "exchangeRateToRMB": 1.71,
    "accounts": [
      {
        "channel": "HSBC",
        "balance": 5230.75,
        "transactions": [
          {
            "date": "2025-09-29T09:28:00",
            "type": "expense",
            "category": "personal",
            "description": "ATM withdrawal",
            "amountMYR": 93.32,
            "amountRMB": 159.57
          },
          {
            "date": "2025-09-26T00:00:00",
            "type": "income",
            "category": "interest",
            "description": "INTEREST CREDIT",
            "amountMYR": 6.76,
            "amountRMB": 11.56
          }
        ]
      },
      {
        "channel": "Grab",
        "balance": 210.0,
        "transactions": []
      }
    ]
  },
  "status": null
}`;
