/**
 * This file tests the ontoME json API
 * https://ontome.net/api/classes-profile.json
 *
 * The test checks all entityBasicType of each class across all profiles owned by project Geovistory (6).
 *
 * If a class has entityBasicType=0, it will be reported at the end of the script.
 *
 */

const fetch = require('node-fetch');
const R = require('ramda');

async function start() {
  classesAndBasicTypes = {};

  // fetch profiles and filter by ownedByProjectID ==6 or selectedByProject ==6
  const profiles = (await fetchProfiles()).filter(
    (p) =>
      p.ownedByProjectID == 6 ||
      (p.selectedByProjects &&
        p.selectedByProjects.projects &&
        p.selectedByProjects.projects.filter((p) => p.projectID == 6).length >
          0)
  );
  console.log(`fetched ${profiles.length} profiles`);

  const classesWithEntityBasicTypeZero = [];

  for (const profile of profiles) {
    const classes = await fetchClasses(profile.profileID);
    console.log(
      `fetched ${classes.length} classes of profile ${profile.profileID}`
    );

    for (const klass of classes) {
      if (klass.entityBasicType == 0) {
        classesWithEntityBasicTypeZero.push({
          classID: klass.classID,
          profileID: klass.profileID,
        });
      }
    }
  }

  console.log('\nREPORT\n');

  if (classesWithEntityBasicTypeZero.length) {
    console.log(
      `WARNING: ${classesWithEntityBasicTypeZero.length} profile-classes have entityBasicTypes 0:`
    );
    console.log(`${JSON.stringify(classesWithEntityBasicTypeZero, null, 2)}:`);
  } else {
    console.log(`Everything fine!`);
  }
}

start().catch((e) => console.log(e));

async function fetchProfiles() {
  const response = await fetch('https://ontome.net/api/profiles.json');
  const profiles = await response.json();
  return profiles;
}

async function fetchClasses(profileID) {
  const response = await fetch(
    'https://ontome.net/api/classes-profile.json?available-in-profile=' +
      profileID
  );
  const classes = await response.json();
  return classes;
}
