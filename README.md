#  OldSchool RuneScape Webscraping API


RuneScape doesn't have an accessible public API to retreive player stats. They do, however have a public [hiscore page](https://secure.runescape.com/m=hiscore_oldschool/overall/) which allows users to enter their username to retrieve ***rank***, ***level***, and ***xp*** of every in-game stat. 

Many websites ***somehow*** offer users the ability to enter their username, receive their stats, and utilize their game calculators, for example, [oldschool.tools](https://oldschool.tools/calculators/skill/fishing/).

<br/>
To achieve similar functionality, I've created an API running on [NodeJS](https://nodejs.org/) ([Express](https://www.npmjs.com/package/express/) ) and utilizing [Got](https://www.npmjs.com/package/got/), and [Cheerio](https://www.npmjs.com/package/cheerio/).

- Got is an alternative HTTP request library to Request, which has been [deprecated as of February 2020](https://github.com/request/request/issues/3142/). 

- Cheerio is basically server-side jQuery. It  allowed me to traverse through the HTML response to find the DOM elements relating to the score table.

Once the table values had been cleansed and collated, all that was left was to return the values packaged up nicely as JSON.

<br/>

The API expects a GET request and takes 1 mandatory parameter **'u'** (*username*) and one optional parameter **'s'** (*skill*). Without this optional parameter, all skills are returned.

With the skill parameter applied, only the one selected skill will be returned. 'overall' obviously not being a skill, but rather the overall rank, xp, and level count of the player.

The possible parameter values are:

|Skills||
|:-|:-|
|agility|hitpoints|
|attack|hunter|
|construction|magic|
|cooking|mining|
|crafting|prayer|
|defence|runecraft|
|farming|slayer|
|firemaking|smithing|
|fishing|strength|
|fletching|thieving|
|herblore|wintertodt|
|woodcutting|overall|

<br/><br/>

For example, endpoints and responses are as follows:

Retrieve all skill stats for user *'zezima'*:
`api/user/?u=zezima`

```json
{
  "username": "Zezima",
  "skills": {
      "fishing": {
        "rank": 576809,
        "level": 77,
        "xp": 1623137
      }
  }
}
```

Retrieve *'fishing'* skill stats for user *'zezima'*:
`api/user/?u=zezima&s=fishing`

```json
{
  "username": "Zezima",
  "skills": {
      "fishing": {
        "rank": 576809,
        "level": 77,
        "xp": 1623137
      }
  }
}
```

<br/>

If a valid request is not made, the server will return a HTTP code: [400 Bad Request](https://httpwg.org/specs/rfc9110.html#status.400/) and provide a reason in JSON:

```json
{
  "result": "error",
  "message": "invalid parameters"
}
```
