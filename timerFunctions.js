const gardenFunctions = require("./gardenFunctions.js");
const request = require("request");
const weatherCache = require("./weatherCache.json")
const fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const functions = require("./functions.js");

// MAIN TIMERS

exports.runTimer = async (client) => {
    updateWeatherCache();

    let seconds = 0;
    let repeatDelay = 20; // in seconds
    setInterval(async function() { 
        seconds += repeatDelay;

        // every minute
        if (seconds % 60 == 0) {
        }
        // every 5 minutes
        if (seconds % 300 == 0) {
            updateWeatherCache();
        }

        // loop through each user
        creatureUserModel.find({} , (err, users) => {
            if(err) console.log(err);

            users.map(async user => {
                // every 20 seconds
                await checkEggHatching(client, user);
                await clearOldBrews(client, user);
                // every minute
                if (seconds % 60 == 0) {
                    await updateGardenWater(client, user);
                }
                // every 5 minutes
                if (seconds % 300 == 0) {
                }
                user.save();
            });
        });

    }, 1000 * repeatDelay) 
}

// creatures

async function checkEggHatching(client, user){
    let toRemove = [];
    // loop through each egg
    for (const egg of user.eggs) {
        const userStats = await functions.getUserStats(client, user.userID, user.guildID);
        const speedScale = 1 - (userStats.eggHatchSpeed - 1);
        if ((new Date).getTime() - egg.obtained.getTime() > egg.hatchTime * speedScale) {
            toRemove.push(user.eggs.indexOf(egg));

            functions.addThingToUser(user.creatures, egg.name,1);

            // send notification if enabled
            const time = new Date().addHours(8);
            if (user.settings.eggNotifs && ((time.getHours() >= 21 || time.getHours() <= 7) || user.settings.nightNotifs)) 
                functions.sendAlert(client, `<@!${user.userID}>! your ${egg.name} has hatched!`, user.guildID) 
            
            // log
            console.log(`hatched ${user.userID}'s ${egg.name} egg`);
            //logCreatureGame(`hatched ${user.userID}'s ${egg.name} egg. they now have\n`);            
        }
    }
    // remove hatched eggs from egg array
    if (toRemove.length > 0){
        for (const index of toRemove){
            if (index > -1) user.eggs.splice(index, 1); // removes 1 element from index
        }
    }
    //user.save(); // save all hatched eggs
}

// brewing

function clearOldBrews(client, user) {
    if (user.brew.started && Date.now() - user.brew.started.getTime() > config.brewExpiry) {
        user.brew.started = null;
        user.brew.steps = [];
        sendAlert(client, `<@!${user.userID}>! your brew has expired D:`, user.guildID) 
    }    
    //user.save();  
}

// garden

async function updateGardenWater(client, user) {
    for (const plant of user.garden.plants) {
    //for (let i = 0; i < user.garden.plants.length; i++) {
        if (plant.name == "none") continue;
        await gardenFunctions.updatePlantWater(client, user, plant);       
    }
    //user.save();                      
}

// weather

function updateWeatherCache() { 
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=Perth&appid=' + process.env['WEATHERTOKEN'];
    request(url, function(err, response, body) {
        // On return, check the json data fetched
        if (err) {
            console.log(err)
        } else {
            let weather = JSON.parse(body);
            if (weather.main == undefined) console.log("error getting weather")
            else {
                //console.log(weather);
                weatherCache.weather = weather.weather[0].main;  
                weatherCache.temperature = weather.main.temp - 273.15;  
                weatherCache.windspd = weather.wind.speed;  
                weatherCache.clouds = weather.clouds.all;  
                fs.writeFileSync("./weatherCache.json", JSON.stringify(weatherCache));
            }
        }
    });
}