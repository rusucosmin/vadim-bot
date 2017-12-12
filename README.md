# Vadim bot

Simple bot that echo some of the [Vadim Tudor's](https://en.wikipedia.org/wiki/Corneliu_Vadim_Tudor) quotes.

# Parametric codes
## Responding to Scans

After generating a parametric code, you should watch for the ref parameter in two places:
* If the user is entering the bot for the first time, the postback webhook will be called.
* If the user is re-entering the bot by scanning the code, the referral webhook will be called.
