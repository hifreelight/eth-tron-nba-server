'use strict';
let xlsx = require('node-xlsx');

module.exports = function(app) {
  //读取文件内容
  let obj = xlsx.parse(__dirname + '/../../docs/teams.xlsx');
  let excelObj = obj[0].data;
  async function importTeams() {
    for (let i in excelObj) {
      if (i == 0 || i == 1) {
        continue;
      }
      let team = {};
      let value = excelObj[i];
      team.nameZh = value[0];
      team.teamZh = value[1];
      team.teamEn = value[2];
      team.nameEn = value[3];
      team.teamKor = value[4];
      team.icon = value[5];
      let valid = true;
      for (let k in team) {
        if (!team[k]) {
          valid = false;
        }
      }
      if (valid) {
        try {
          await app.models.Team.findOrCreate({ where: { nameZh: team.nameZh } }, team);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  importTeams();
};

