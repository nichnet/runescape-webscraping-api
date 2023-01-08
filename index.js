const express = require('express');
const got = require('got');
const cheerio = require('cheerio');

const app = express();
const PORT = 8080;
const SKILLS = ["attack", "defence", "strength", "hitpoints", "prayer", "magic", "cooking", "woodcutting", "fletching", "fishing", "firemaking", "crafting", "smithing", "mining", "herblore", "agility", "thieving", "slayer", "farming", "runecraft", "hunter", "construction", "wintertodt"];

app.listen(PORT);
console.log(`API is running on port: ${PORT}`);

//--------------API Path--------------
app.get('/api/user/stats/', async (req, res) => {
    //validate request. 
    let username = req.query.u;
    let skill = req.query.s;

    if(!validateRequest(res, username, skill)) {
        return;
    }

    //proceed with request
    let scraped = await scrapeUserStats(username);

    if(scraped.result != "success") {
        res.json(scraped);
        return;
    }

    //only successful requests will increase usage count. OPTIONAL.
    increaseTokenUsage(authToken);

    out = {};

    if(scraped.result == "success") {
        out.username = username;
        out.skills = skill === undefined ? scraped.skills : scraped.skills[skill];
    }

    //return the json
    res.json(out);
});

//-----------Main Functions-----------
function validateRequest(res, username, skill) {
    let errors = 0;
    let reason = "unknown";

    if(username === undefined){
        reason = "invalid parameters";
        errors += 1;
    }
    
    if(!SKILLS.includes(skill) && skill !== undefined){//must be in skill list or null
        reason = "invalid parameters";
        errors += 1;
    }
    

    if(errors > 0) {
        res.status(400); //Bad Request
        res.json({"result": "error", "message":reason});
        return false;
    }

    return true;
}

async function scrapeUserStats(username) {
    try {
        console.log("Searching for username: " + username);
        let response = await got(`https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal?user1=${username}`);

        let body = response.body;
        
        var $ = cheerio.load(body);

        var tableRows = $('#contentHiscores > table > tbody > tr');
        
        skills = {};

        lastSkill = "";

        tableRows.each((i, e) => {//iterate each table row
            tds = $(e).children();
            if(i > 2) {//skip junk at the beginning.
                tds.each((ii, ee) => {//iterate each row td
                    let val = $(ee).text().trim().toLowerCase();

                    if(ii == 1) {
                        if(SKILLS.includes(val) || val == "overall") { 
                            skills[val] =  {};
                            lastSkill = val;
                        }

                    }
                    
                    if(lastSkill != ""){
                        switch(ii) {
                            case 2:
                                skills[lastSkill].rank = parseInt(val.replaceAll(',', ''));
                                break;
                            case 3:
                                let v = parseInt(val.replaceAll(',', ''));

                                if(lastSkill == "wintertodt") {
                                    skills[lastSkill].score = v;
                                } else {
                                    skills[lastSkill].level = v;
                                }
                                break;
                            case 4:
                                skills[lastSkill].xp = parseInt(val.replaceAll(',', ''));
                                break;
                        }
                    }
                });
            }
        });

        return {
            result: "success",
            skills: skills
        };
    } catch(error) {
        console.log("Error: " + error.message);
        return {"result": "error", message:"unknown"};
    }
}
