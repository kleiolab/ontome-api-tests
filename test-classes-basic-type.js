/**
 * This file tests the ontoME json API
 * https://ontome.net/api/classes-profile.json
 * 
 * The test compares the entityBasicType of each class across all profiles.
 * 
 * If a class has different entityBasicTypes, it will be reported at the end of the script.
 * 
 */

const fetch = require('node-fetch');
const R = require('ramda');

async function start() {
  classesAndBasicTypes = {};

  const profiles = await fetchProfiles();
  console.log(`fetched ${profiles.length} profiles`);

  for (const profile of profiles) {
    const classes = await fetchClasses(profile.profileID);
    console.log(
      `fetched ${classes.length} classes of profile ${profile.profileID}`
    );

    for (const klass of classes) {
      classesAndBasicTypes[klass.classID] = [
        ...(classesAndBasicTypes[klass.classID] || []),
        {
          entityBasicType: klass.entityBasicType,
          profileID: klass.profileID,
        },
      ];
    }
  }
  const report = [];
  for (const key in classesAndBasicTypes) {
    const items = classesAndBasicTypes[key];
    const reportItem = {
      classID: key,
      distinctTypes: R.uniqBy((x) => x.entityBasicType, items).length,
      profiles: items.map((i) => i.profileID + ': ' + i.entityBasicType),
    };

    report.push(reportItem);
  }

  const problematic = report.filter((x) => x.distinctTypes > 1);

  console.log('\nREPORT\n');
  console.log(
    `${report.length - problematic.length} of ${
      report.length
    } classes have consistent entityBasicType across all profiles`
  );

  if (problematic.length) {
    console.log(`WARNING: ${problematic.length} classes have inconsistent entityBasicTypes across the profiles:`);
    console.log(problematic);
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
