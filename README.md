# Vadim bot

Simple bot that echo some of the [Vadim Tudor's](https://en.wikipedia.org/wiki/Corneliu_Vadim_Tudor) quotes.

## Change offers

In order to change (or add if not existent) the offer in a location, run the following request in a terminal:

```bash
curl -X POST \
  https://fast-bayou-81426.herokuapp.com/offers \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 998eedb3-c6df-c1ab-9fce-cad00c2f28e0' \
  -d '{
	"ref": "cluj-napoca",
	"offer": "hookah 50% off",
	"price": "Very very low",
	"message": "Best hookah in town, 50% off when buying two hookahs",
	"type": "hookah",
	"deeplink": "https://nameless-basin-57929.herokuapp.com/party/3301"
}'
```

You can change every parameter, but please user strings for now. Ref is the
id from the parametric code.

## Parametric Codes

In order to test the bot, you can send me an email at cr[dot]rusucosmin[at]gmail[dot]com
with your facebook username in order to whitelist your account.
Otherwise, the bot will not work for you since it's not yet in production.
To run it in production, you need to have `Facebook` review it.

### Loomni
![loomni](/codes/loomni.png)

### Economica2
![economica2](/codes/economica2.png)

### Cluj-Napoca
![cluj-napoca](/codes/cluj-napoca.png)

### No referral
![no_ref](/codes/no_ref.png)
