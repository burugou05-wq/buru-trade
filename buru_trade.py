# BURU_TRADE - Simple stock trading simulation game
# The player can buy shares from multiple companies and sell them later at higher prices.
# Run the script to start the game in the console.

import random
import sys

class Company:
    def __init__(self, name, base_price):
        self.name = name
        self.base_price = base_price
        self.price = base_price

    def fluctuate(self):
        # Random price change between -10% and +10% of current price
        change_percent = random.uniform(-0.1, 0.1)
        self.price = max(1, round(self.price * (1 + change_percent), 2))

    def __repr__(self):
        return f"{self.name}: ${self.price:.2f}"

class Investor:
    def __init__(self, cash=1000.0):
        self.cash = cash
        self.holdings = {}  # company name -> shares

    def buy(self, company: Company, shares: int):
        cost = company.price * shares
        if cost > self.cash:
            print("Not enough cash.")
            return False
        self.cash -= cost
        self.holdings[company.name] = self.holdings.get(company.name, 0) + shares
        print(f"Bought {shares} shares of {company.name} for ${cost:.2f}.")
        return True

    def sell(self, company: Company, shares: int):
        owned = self.holdings.get(company.name, 0)
        if shares > owned:
            print("You don't own that many shares.")
            return False
        revenue = company.price * shares
        self.cash += revenue
        self.holdings[company.name] = owned - shares
        if self.holdings[company.name] == 0:
            del self.holdings[company.name]
        print(f"Sold {shares} shares of {company.name} for ${revenue:.2f}.")
        return True

    def net_worth(self, companies):
        value = self.cash
        for comp in companies:
            shares = self.holdings.get(comp.name, 0)
            value += shares * comp.price
        return value

def create_companies():
    names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
    return [Company(name, random.randint(10, 100)) for name in names]

def print_status(investor, companies, day):
    print("\n--- Day {} ---".format(day))
    print(f"Cash: ${investor.cash:.2f}")
    print("Holdings:")
    if investor.holdings:
        for name, shares in investor.holdings.items():
            print(f"  {name}: {shares} shares")
    else:
        print("  (none)")
    print("Market Prices:")
    for comp in companies:
        print(f"  {comp}")
    print(f"Net Worth: ${investor.net_worth(companies):.2f}")

def main():
    random.seed()
    investor = Investor()
    companies = create_companies()
    day = 1
    while True:
        # fluctuate market prices each day
        for comp in companies:
            comp.fluctuate()
        print_status(investor, companies, day)
        print("\nWhat would you like to do? (buy/sell/skip/quit)")
        action = input("> ").strip().lower()
        if action == "buy":
            print("Enter company name:")
            cname = input("> ").strip()
            comp = next((c for c in companies if c.name.lower() == cname.lower()), None)
            if not comp:
                print("Company not found.")
                continue
            print("Enter number of shares to buy:")
            try:
                shares = int(input("> ").strip())
                if shares <= 0:
                    raise ValueError
            except ValueError:
                print("Invalid number.")
                continue
            investor.buy(comp, shares)
        elif action == "sell":
            print("Enter company name:")
            cname = input("> ").strip()
            comp = next((c for c in companies if c.name.lower() == cname.lower()), None)
            if not comp:
                print("Company not found.")
                continue
            print("Enter number of shares to sell:")
            try:
                shares = int(input("> ").strip())
                if shares <= 0:
                    raise ValueError
            except ValueError:
                print("Invalid number.")
                continue
            investor.sell(comp, shares)
        elif action == "skip":
            pass  # just go to next day
        elif action == "quit":
            print("Final net worth: ${:.2f}".format(investor.net_worth(companies)))
            break
        else:
            print("Unknown command.")
            continue
        day += 1

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
