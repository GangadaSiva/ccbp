let express = require("express");
let obj = express();
obj.use(express.json());
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    obj.listen(3000, () => {
      console.log("Sever initializing at //localhost:3000");
    });
  } catch (e) {
    console.log(`DbError ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//get Players
obj.get("/players/", async (request, Response) => {
  let sqlGetQueuery = `
        SELECT * FROM cricket_team;
    `;
  let playersArray = await db.all(sqlGetQueuery);

  let res = [];
  for (let each of playersArray) {
    let converted = convertDbObjectToResponseObject(each);
    res.push(converted);
  }
  Response.send(res);
});
//post player
obj.post("/players/", async (request, Response) => {
  let playerDetails = request.body;
  let { playerName, jerseyNumber, role } = playerDetails;
  let sqlPostQueuery = `
     INSERT INTO cricket_team
        (player_name,jersey_number,role)
        values('${playerName}','${jerseyNumber}','${role}');
    `;
  await db.run(sqlPostQueuery);
  Response.send("Player Added to Team");
});
//api3
obj.get("/players/:playerId/", async (request, Response) => {
  let { playerId } = request.params;
  let sqlGetQueuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  let player = await db.get(sqlGetQueuery);
  let conPlayer = convertDbObjectToResponseObject(player);
  Response.send(conPlayer);
});
//Api4
obj.put("/players/:playerId/", async (request, response) => {
  let playerDetails = request.body;
  let { playerId } = request.params;
  let { playerName, jerseyNumber, role } = playerDetails;
  let sqlUpdate = `
        UPDATE cricket_team
        SET
           player_name = '${playerName}',
           jersey_number = '${jerseyNumber}',
           role = '${role}'
        WHERE
            player_id = ${playerId};    
    `;
  await db.run(sqlUpdate);
  response.send("Player Details Updated");
});
//Api5
obj.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let sqlDelete = `
        DELETE FROM cricket_team WHERE player_id = ${playerId};
    `;
  await db.run(sqlDelete);
  response.send("Player Removed");
});
module.exports = obj;
