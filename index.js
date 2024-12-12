

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIFI_4lVb7FJmKgzWMbq6ZfKcBwpj-K4E",
  authDomain: "biobank-development.firebaseapp.com",
  databaseURL: "https://biobank-development-default-rtdb.firebaseio.com",
  projectId: "biobank-development",
  storageBucket: "biobank-development.firebasestorage.app",
  messagingSenderId: "31278898937",
  appId: "1:31278898937:web:01f96df7a640d9c1410c28",
  measurementId: "G-B98TGR5Q8Q"
};





// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.database(app);


let currentBloodBoxIndex = 0;
let boxKeys = [];

function populateBBData() {
  const path = 'bb/';

  db.ref(path).once('value')
    .then(snapshot => {
      const boxes = snapshot.val();
      if (boxes) {
        boxKeys = Object.keys(boxes); // Populate boxKeys here

        const activeBoxIndex = boxKeys.findIndex(boxKey => boxes[boxKey].bxsts === 'AC');

        if (activeBoxIndex !== -1) {
          currentBloodBoxIndex = activeBoxIndex;
        } else {
          console.warn('No active box found with bxsts = "AC".');
        }

        const boxVal = boxKeys[currentBloodBoxIndex]; // Use the determined or default index
        console.log("Active boxVal:", boxVal);

        document.getElementById('box_id').textContent = boxVal;
        return db.ref(`bb/${boxVal}/`).once('value');
      } else {
        throw new Error('No boxes found in Firebase.');
      }
    })
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        populateBBLabels(data);
      }
    })
    .catch(error => {
      console.error('Error fetching data from Firebase:', error);
    });
}

function populateBBLabels(data) {
  const rows = 'ABCDEFGHIJ';
  const cols = 10;

  const bioBankIds = Object.keys(data).map(key => data[key].bioBankId);
  const sts = Object.keys(data).map(key => data[key].status);
  const sample = Object.keys(data).map(key => data[key].sampleType);

  console.log("sts", sts);
  console.log("sample", sample);

  if (bioBankIds.length < 100) {
    console.warn('Not enough bioBankIds available for the matrix.');
  }

  for (let row = 0; row < rows.length; row++) {
    for (let col = 1; col <= cols; col++) {
      const labelName = `label_B${rows[row]}${col}`;
      const labelElement = document.getElementById(labelName);
      const index = row * cols + (col - 1);

      if (labelElement) {
        labelElement.textContent = `${bioBankIds[index]} \n ${sample[index]}` || '';
        labelElement.style.fontWeight = "bold";
        if (sts[index] === "o") {
          labelElement.style.background = "rgb(129, 129, 192)";

          // Add click event for status "o"
          labelElement.addEventListener('click', async function () {
            console.log('Fetching data for:', labelName);

            const bioBankId = bioBankIds[index];
            const sampleType = sample[index];

           
              const dbRef = db.ref(`sef/${bioBankId}`);
              const snapshot = await dbRef.get();

              if (!snapshot.exists()) {
                console.log("No data found for bioBankId:", bioBankId);
                return;
              }

              const dbData = snapshot.val();
              const matchedData = [];

              Object.keys(dbData).forEach(seqNum => {
                const seqData = dbData[seqNum];

                Object.keys(seqData).forEach(timestamp => {
                  const timestampData = seqData[timestamp];
                  console.log("timestampData",timestampData)
                  console.log("timestampData",sampleType)
                  let mode = "SearchView"

                  if ((sampleType === "Plasma"|| sampleType === "MPlasma") && timestampData.ie) {
                    const bpg = timestampData.ie.bpg;
                    const bpgIndex1 = bpg.split('/')[1];
                    console.log("bpgIndex1", bpgIndex1);
                    console.log("bpgIndex1", getSeatLabel(index));

                    if (bpgIndex1 && bpgIndex1.split(',').includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)
                    }
                  }
                  if ((sampleType === "Serum" || sampleType === "MSerum")&& timestampData.ie) {
                    const bsg = timestampData.ie.bsg;
                    console.log("bsg", bsg);
                    console.log("bsgIndex1", getSeatLabel(index));
                    const bsgIndex1 = bsg.split('/')[1]; // get index1
                    console.log("bsgIndex1", bsgIndex1);

                    if (bsgIndex1 && bsgIndex1.split(',').includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)

                    }
                  }
                  if ((sampleType === "Buffy Coat" || sampleType === "MBuffy Coat") && timestampData.ie) {
                    const bbcg = timestampData.ie.bbcg;
                    console.log("bbcg", bbcg);
                    console.log("bbcgIndex1", getSeatLabel(index));
                    const bbcgIndex1 = bbcg.split('/')[1];
                    console.log("bbcgIndex1", bbcgIndex1);

                    if (bbcgIndex1 && bbcgIndex1.split(',').includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)
                    }
                  }
                  if ((sampleType === "Other" || sampleType ===  "MOther") && timestampData.ie) {
                    const osg = timestampData.ie.osg;
                    console.log("osg", osg);
                    console.log("osgIndex1", getSeatLabel(index));
                    const osgIndex1 = osg.split('/')[1];
                    console.log("osgIndex1", osgIndex1);

                    if (osgIndex1 && osgIndex1.includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)
                    }
                  }
                });
              });

              if (matchedData.length > 0) {
                console.log('Matched Data:', matchedData);
              } else {
                console.log('No match found for:', labelName);
              }
          });
        }
        if (sts[index] === "s") {
          labelElement.style.background = "rgb(180, 180, 180)";
        }
        if (sts[index] === "ps") {
          labelElement.style.background = "rgb(193, 154, 107)";
        }
        if (sts[index] === "e") {
          labelElement.style.background = "rgb(143, 218, 187)";
          // Add click event only if the status is 'e'
          labelElement.addEventListener('click', function () {
            console.log("sts[index]",sts[index]);
            console.log('label name of clicked seat:', labelName);
            $('#exampleModalCenter').modal('show');
          });
        }
      }
    }
  }
}

function getSeatLabel(index) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = 10;

  const rowIndex = Math.floor(index / cols);    // Get the row index (zero-based)
  const colIndex = index % cols;                // Get the column index (zero-based)

  const rowLetter = rows[rowIndex];             // Get the corresponding row letter
  const colNumber = colIndex + 1;               // Convert zero-based index to 1-based column number

  return `${rowLetter}${colNumber}`;            // Return seat label (e.g., 'C6')
}


function prev1Box() {
  if (currentBloodBoxIndex > 0) {
    loadBBox();  // Call loadBox to show the loading spinner
    currentBloodBoxIndex--;
    populateBBDataForCurrentBox();
  }
}

function next1Box() {
  if (currentBloodBoxIndex < boxKeys.length - 1) {
    loadBBox();  // Call loadBox to show the loading spinner
    currentBloodBoxIndex++;
    populateBBDataForCurrentBox();
  }
}


// function loadBox() {

//   const load = document.getElementById('loadprogress');

//   load.style.display = "block"

//   console.log("Hello Bhanu");
//   setTimeout(() => {
//     load.style.display = "none"
//     populateBBDataForCurrentBox();
//   }, 500);
// }


function loadBBox() {
  event.preventDefault();

  const container = document.getElementById('blood-box-container');
  var loadprogress = document.getElementById('Bloadprogress');
  loadprogress.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
      `;
  loadprogress.style.display = "block"

  container.style.display = "none"

  console.log("Hello Bhanu");
  setTimeout(() => {
    loadprogress.innerHTML = '';
    loadprogress.style.display = "none"

    container.style.display = "block"
    populateBBDataForCurrentBox();
  }, 1000);
}




function populateBBDataForCurrentBox() {
  const boxVal = boxKeys[currentBloodBoxIndex]; // Use the current index
  console.log("boxVal", boxVal);

  document.getElementById('box_id').textContent = boxVal;
  db.ref(`bb/${boxVal}/`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        populateBBLabels(data);
      }
    })
    .catch(error => {
      console.error('Error fetching data from Firebase:', error);
    });
}

// Initial call to populate the first box when the page loads
window.onload = function () {
  populateBBData(); // Populate the first box on page load
};




function test1() {
  populateBBData();
}




// function saveSBToFirebase() {

//   db.ref("sb").set(specimenDataArray)
//     .then(() => {
//       console.log("BBcaseDataArray successfully saved to Firebase.");
//     })
//     .catch((error) => {
//       console.error("Error saving data to Firebase: ", error);
//     });
// }




let currentSpecimenBoxIndex = 0;
let sBBoxKeys = [];

function populateSBData() {
  const path = 'sb/';

  db.ref(path).once('value')
    .then(snapshot => {
      const boxes = snapshot.val();
      if (boxes) {
        sBBoxKeys = Object.keys(boxes);


        const activeBoxIndex = sBBoxKeys.findIndex(sBBoxKeys => boxes[sBBoxKeys].bxsts === 'AC');

        if (activeBoxIndex !== -1) {
          currentSpecimenBoxIndex = activeBoxIndex;
        } else {
          console.warn('No active box found with bxsts = "AC".');
        }


        const boxVal = sBBoxKeys[currentSpecimenBoxIndex];
        console.log("boxVal", boxVal);

        document.getElementById('sbox_id').textContent = boxVal;
        return db.ref(`sb/${boxVal}/`).once('value');
      } else {
        throw new Error('No boxes found in Firebase.');
      }
    })
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        populateSBLabels(data);
      }
    })
    .catch(error => {
      console.error('Error fetching data from Firebase:', error);
    });
}

function populateSBLabels(data) {
  const rows = 'ABCDEFGHIJ';
  const cols = 10;

  const bioBankIds = Object.keys(data).map(key => data[key].bioBankId);
  const sts = Object.keys(data).map(key => data[key].status);
  const sample = Object.keys(data).map(key => data[key].sampleType);

  console.log("sts", sts)
  console.log("sample", sample)


  if (bioBankIds.length < 100) {
    console.warn('Not enough bioBankIds available for the matrix.');
  }

  for (let row = 0; row < rows.length; row++) {
    for (let col = 1; col <= cols; col++) {
      const labelName = `label_S${rows[row]}${col}`;
      const labelElement = document.getElementById(labelName);
      const index = row * cols + (col - 1);

      // document.getElementById(labelName).addEventListener('click', function () {
      //   console.log('label name of click seat', labelName);
      //   $('#exampleModalCenter').modal('show');
      // });

      if (labelElement) {
        labelElement.textContent = `${bioBankIds[index]} \n ${sample[index]}` || '';
        labelElement.style.fontWeight = "bold"

        if (sts[index] === "o") {
          labelElement.style.background = "rgb(129, 129, 192)"
          labelElement.addEventListener('click', async function () {
            console.log('Fetching data for:', labelName);

            const bioBankId = bioBankIds[index];
            const sampleType = sample[index];

           
              const dbRef = db.ref(`sef/${bioBankId}`);
              const snapshot = await dbRef.get();

              if (!snapshot.exists()) {
                console.log("No data found for bioBankId:", bioBankId);
                return;
              }

              const dbData = snapshot.val();
              const matchedData = [];

              Object.keys(dbData).forEach(seqNum => {
                const seqData = dbData[seqNum];

                Object.keys(seqData).forEach(timestamp => {
                  const timestampData = seqData[timestamp];
                  console.log("timestampData",timestampData)
                  console.log("timestampData",sampleType)
                  let mode = "SearchView"

                  if ((sampleType === "FT-1"|| "MFT-1") && timestampData.ie) {
                    const ftg = timestampData.ie.ftg;
                    const ftgIndex1 = ftg.split('/')[1];
                    console.log("ftgIndex1", ftgIndex1);
                    console.log("ftgIndex1", getSeatLabel(index));

                    if (ftgIndex1 && ftgIndex1.split(',').includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)
                    }
                  }
                  if ((sampleType === "FN-1"|| "MFN-1") && timestampData.ie) {
                    const fng = timestampData.ie.fng;
                    const fngIndex1 = fng.split('/')[1];
                    console.log("fngIndex1", fngIndex1);
                    console.log("fngIndex1", getSeatLabel(index));

                    if (fngIndex1 && fngIndex1.split(',').includes(getSeatLabel(index))) {
                      matchedData.push({
                        bioBankId,
                        seq: seqNum,
                        timestamp
                      });
                      pages_display(mode, bioBankId, seqNum, timestamp)
                    }
                  }
                });
              });

              if (matchedData.length > 0) {
                console.log('Matched Data:', matchedData);
              } else {
                console.log('No match found for:', labelName);
              }
          });
        }
        if (sts[index] === "s") {
          labelElement.style.background = "rgb(180, 180, 180)"
        }
        if (sts[index] === "ps") {
          labelElement.style.background = "rgb(82, 54, 54)"
        }
        if (sts[index] === "e") {
          labelElement.style.background = "rgb(143, 218, 187)"
          // Add click event only if the status is 'e'
          labelElement.addEventListener('click', function () {
            console.log('label name of clicked seat:', labelName);
            $('#exampleModalCenter').modal('show');
          });
        }
      }

    }
  }
}




function prev2Box() {
  if (currentSpecimenBoxIndex > 0) {
    loadSBox();
    currentSpecimenBoxIndex--;
    populateSBDataForCurrentBox()
  }
}

function next2Box() {
  if (currentSpecimenBoxIndex < sBBoxKeys.length - 1) {
    loadSBox();
    currentSpecimenBoxIndex++;
    populateSBDataForCurrentBox()
  }
}

function loadSBox() {
  event.preventDefault();

  const container = document.getElementById('specimen-box-container');
  var loadprogress = document.getElementById('Sloadprogress');
  loadprogress.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading...
      `;
  loadprogress.style.display = "block"

  container.style.display = "none"

  console.log("Hello Bhanu");
  setTimeout(() => {
    loadprogress.innerHTML = '';
    loadprogress.style.display = "none"

    container.style.display = "block"
    populateSBDataForCurrentBox();
  }, 1000);
}

function populateSBDataForCurrentBox() {
  const boxVal = sBBoxKeys[currentSpecimenBoxIndex];
  console.log("boxVal", boxVal);

  document.getElementById('sbox_id').textContent = boxVal;
  db.ref(`sb/${boxVal}/`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        populateSBLabels(data);
      }
    })
    .catch(error => {
      console.error('Error fetching data from Firebase:', error);
    });
}



function test2() {
  populateSBData();
}



// let specimenDataArray = {};
// let specimenBoxCount = 1;
// let currentSpecimenBoxIndex = 1;

// function test2() {
//   populateSpecimenBox("specimen-box-1", 100);
//   saveSBToFirebase();
// }

// let totalSpecimenBoxes = 1;
// let specimenSeatCounter = 0;


// function populateSpecimenBox(boxName, n) {
//   let seats1 = document.querySelector(`#${boxName}`);
//   document.getElementById("sbox_id").innerHTML = `SB ${boxName}`;
//   let k = 0;
//   const components = ["FN-1", "FN-2", "FN-3", "FT-1", "FT-2", "FT-3"];

//   specimenDataArray[boxName] = [];

//   for (let i = 0; i < n; i++) {
//     let booked = "";
//     let componentId = "";
//     let seat1ID = 'P' + (++specimenSeatCounter);
//     let grid1Id = specimenSeatCounter;

//     if (k === 3) {
//       k = 0;
//     }

//     if (i >= 0 && i <= 49) {
//       booked = "booked";
//       componentId = components[k];
//       k++;
//     } else {
//       booked = "unselected";
//       componentId = "";
//     }

//     specimenDataArray[boxName].push({
//       seatID: seat1ID,
//       gridID: grid1Id,
//       booked: booked,
//       component: componentId || ""
//     });
//   }

//   specimenDataArray[boxName].forEach((seat) => {
//     let labelID = 'label_' + seat.seatID;
//     let labelContent = seat.booked === "booked" ? 'BR_' + seat.gridID + " <br>" + seat.component : '';

//     seats1.insertAdjacentHTML(
//       "beforeend",
//       '<input type="checkbox" name="tickets" id="' + seat.seatID + '" />' +
//       '<label id="' + labelID + '" for="' + seat.seatID + '" class="seat ' + seat.booked + '">' +
//       labelContent + '</label>'
//     );

//     document.getElementById(labelID).style.fontSize = '10px';
//     document.getElementById(labelID).style.color = 'rgb(255, 255, 255)';
//     document.getElementById(labelID).style.textAlign = 'center';

//     let seatCheckbox = document.getElementById(seat.seatID);
//     seatCheckbox.addEventListener('click', function () {
//       openModal();
//     });
//   });

//   console.log(specimenDataArray);
// }

// function addSpecimenBox() {
//   totalSpecimenBoxes++;
//   let newBoxName = "specimen-box-" + totalSpecimenBoxes;

//   const newBox = `
//     <div class="specimen-box" id="${newBoxName}" style="display: none;">
//       <div class="status">
//       <div class="item">Empty</div>
//       <div class="item">Occupied</div>
//       <div class="item">Partial Shared</div>
//       <div class="item">Shared</div>
//       </div>
//     </div>
//   `;

//   document.getElementById("specimen-box-container").insertAdjacentHTML('beforeend', newBox);



//   let seatLimit = 100;
//   populateSpecimenBox(newBoxName, seatLimit);

//   alert(`Specimen Box ${totalSpecimenBoxes} added`);
// }









function openModal(seatInfo) {
  $('#exampleModalCenter').modal('show');
}








function AppendBloodBox(boxName) {
  const newBoxData = {};

  // Prepare the new box data
  for (let i = 0; i < 101; i++) {
    if (i < 100) {
      newBoxData[i] = {
        bioBankId: "",
        sampleType: "",
        status: "e"
      };
    } else {
      newBoxData['bxsts'] = "AC";  // New box status is Active (AC)
    }
  }
  db.ref('bb/').once('value')
    .then(snapshot => {
      const existingBoxes = snapshot.val();
      if (existingBoxes) {
        for (const existingBox in existingBoxes) {
          if (existingBox !== boxName) {
            // Update old boxes' status to 'IAC' (Inactive)
            const oldBoxData = existingBoxes[existingBox];
            const updatedOldBoxData = {};

            for (let i = 0; i < 100; i++) {
              updatedOldBoxData[i] = oldBoxData[i] || {
                bioBankId: "",
                sampleType: "",
                status: "IAC"  // Mark old boxes as Inactive (IAC)
              };
            }

            updatedOldBoxData['bxsts'] = "IAC";  // Mark the old box itself as Inactive (IAC)
            db.ref('bb/' + existingBox + '/').set(updatedOldBoxData)
              .catch((error) => {
                console.error("Error updating old box status: ", error);
              });
          }
        }
      }

      // Now, add the new box with the active status
      db.ref('bb/' + boxName + '/').set(newBoxData)
        .then(() => {
          console.log("New box added successfully to Firebase.");
        })
        .catch((error) => {
          console.error("Error saving new box to Firebase: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching existing boxes: ", error);
    });
}


function AppendSpecimenBox(boxName) {
  const newBoxData = {};

  for (let i = 0; i < 101; i++) {
    if (i < 100) {
      newBoxData[i] = {
        bioBankId: "",
        sampleType: "",
        status: "e"
      };
    }
    else {
      newBoxData['bxsts'] = "AC";
    }
  }
  db.ref('sb/').once('value')
    .then(snapshot => {
      const existingBoxes = snapshot.val();
      if (existingBoxes) {
        for (const existingBox in existingBoxes) {
          if (existingBox !== boxName) {
            // Update old boxes' status to 'IAC' (Inactive)
            const oldBoxData = existingBoxes[existingBox];
            const updatedOldBoxData = {};

            for (let i = 0; i < 100; i++) {
              updatedOldBoxData[i] = oldBoxData[i] || {
                bioBankId: "",
                sampleType: "",
                status: "IAC"  // Mark old boxes as Inactive (IAC)
              };
            }

            updatedOldBoxData['bxsts'] = "IAC";  // Mark the old box itself as Inactive (IAC)
            db.ref('sb/' + existingBox + '/').set(updatedOldBoxData)
              .catch((error) => {
                console.error("Error updating old box status: ", error);
              });
          }
        }
      }

      // Now, add the new box with the active status
      db.ref('sb/' + boxName + '/').set(newBoxData)
        .then(() => {
          console.log("New box added successfully to Firebase.");
        })
        .catch((error) => {
          console.error("Error saving new box to Firebase: ", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching existing boxes: ", error);
    });
}

function data() {
  db.ref('bb').once('value', (snapshot) => {
    const data = snapshot.val();
    console.log("All Data at bb:", data);
    if (data) {
      Object.keys(data).forEach((childKey) => {
        const childData = data[childKey];
        console.log(`Key: ${childKey}, Data:`, childData);
      });
    }
  });
}

console.log(" -- mrn -- " + localStorage.getItem("MRN") || '');
console.log(" -- bio id -- " + localStorage.getItem("BioVal") || '');

let user = sessionStorage.getItem('userName');
console.log("User Name", user)



// function validateForm1() {
//   const requiredFields = [
//     { field: document.getElementById('mrnNo'), name: 'MRN Number' },
//     { field: document.getElementById('bioBankId'), name: 'Bio Bank ID' },
//     { field: document.getElementById('patAge'), name: 'Age' },
//     { field: document.querySelector('input[name="customRadio"]:checked'), name: 'Gender' },
//     { field: document.querySelector('input[name="radioCancerType"]:checked'), name: 'Cancer Type' },
//     { field: document.querySelector('input[name="customProcedure"]:checked'), name: 'Procedure Types' },
//     { field: document.querySelector('input[name="MetastasisSample"]:checked'), name: 'Metastasis Sample' },
//     { field: document.querySelector('input[name="bloodSample"]:checked'), name: 'Blood Sample' },
//     { field: document.querySelector('input[name="specimenSample"]:checked'), name: 'Specimen Sample' },
//     { field: document.querySelector('input[name="otherSample"]:checked'), name: 'Other Sample' },
//     { field: document.querySelector('input[name="customConsent"]:checked'), name: 'Consent' },
//     { field: document.querySelector('input[name="IschemicRadio"]:checked'), name: 'Ischemic Sample' },
//     { field: document.querySelector('input[name="processedRadio"]:checked'), name: 'All samples Received Together' }
//   ];

//   let allFilled = true;
//   const emptyFields = [];

//   requiredFields.forEach(item => {
//     if (!item.field || (item.field.type === 'radio' && !item.field.checked) || (item.field.type === 'number' && item.field.value === '')) {
//       allFilled = false;
//       emptyFields.push(item.name);
//     }
//   });

//   if (!allFilled) {
//     console.log('Please fill in the following required fields:', emptyFields.join(', '));
//     alert('Please enter all the required fields. Check the console for details.');
//     return;  // Stop the function if fields are missing
//   }

//   // Collect form data
//   const bioBankId = document.getElementById('bioBankId').value;
//   const timestamp = Math.floor(Date.now() / 1000); // Current timestamp

//   const data = {
//     ie: {
//       ag: document.getElementById('patAge').value,
//       sx: document.querySelector('input[name="customRadio"]:checked').value,
//       ct: document.querySelector('input[name="radioCancerType"]:checked').value,
//       tpr: document.querySelector('input[name="customProcedure"]:checked').value,
//       dpr: document.getElementById('procedureDetail').value,
//       srn: document.getElementById('surgeonName').value,
//       ss: document.querySelector('input[name="specimenSample"]:checked').value,
//       nft: document.getElementById('ft_tubes').value,
//       nfn: document.getElementById('fn_tubes').value,
//       bs: document.querySelector('input[name="bloodSample"]:checked').value,
//       bpg: document.getElementById('PlasmagridNo').value,
//       bsg: document.getElementById('SerumgridNo').value,
//       bbcg: document.getElementById('bufferCoatgridNo').value,
//       osmp: document.querySelector('input[name="otherSample"]:checked').value,
//       osg: document.getElementById('OSgridNo').value,
//       osdsc: document.getElementById('otSampleDesc').value,
//       mts: document.querySelector('input[name="MetastasisSample"]:checked').value,
//       cnst: document.querySelector('input[name="customConsent"]:checked').value,
//       iss: document.querySelector('input[name="IschemicRadio"]:checked').value,
//       prb: document.getElementById('processedBy').value,
//       scpt: document.querySelector('input[name="processedRadio"]:checked').value,
//       srt: document.getElementById('sampleReceivedTime').value,
//       spt: document.getElementById('sampleProcessedTime').value,
//       brt: document.getElementById('bloodSampleReceivedTime').value,
//       bpt: document.getElementById('bloodSampleProcessedTime').value,
//       sprt: document.getElementById('SpecimenSampleReceivedTime').value,
//       sppt: document.getElementById('SpecimenSampleProcessedTime').value,
//       osrt: document.getElementById('OtherSampleReceivedTime').value,
//       ospt: document.getElementById('OtherSampleProcessedTime').value,
//       sef_ub: 'currentUser'
//     },
//     md: {
//       fhc: "",
//       fhcr: "",
//       fhct: "",
//       fh: "",
//       hac: "",
//       hs: "",
//       ec: "",
//       ecm: "",
//       ffqc: "",
//       ftr: "",
//       ts: "",
//       tp: "",
//       ad: "",
//       cs: "",
//       ihcm: "",
//       ihcd: "",
//       gt: "",
//       gtd: "",
//       pst: "",
//       gd: "",
//       fc: "",
//       lvi: "",
//       pni: "",
//       ptnm: "",
//       as: "",
//       nnt: "",
//       npn: "",
//       ts: "",
//       dm: "",
//       mpt: "",
//       btn: "",
//       bd: "",
//       nact: "",
//       nactdc: "",
//       nactdlc: "",
//       stn: "",
//       sd: "",
//       rcbs: "",
//       act: "",
//       actdc: "",
//       actdls: "",
//       rd: "",
//       rdd: "",
//       rtdls: "",
//       mdu: 'currentUser',
//       ipba: ""
//     },
//     brf: {
//       am: "",
//       pty: "",
//       noc: "",
//       afc: "",
//       bf: "",
//       dbf: "",
//       ms: "",
//       ad: "",
//       er: "",
//       pr: "",
//       h2: "",
//       sbt: "",
//       k67: "",
//       cs: "",
//       ht: "",
//       sps: ""
//     }
//   };

//   // Automatically increment the section (s[i+1])
//   db.ref(`sef/${bioBankId}`).once('value', snapshot => {
//     const sections = snapshot.val();
//     let nextSectionIndex = 1; // Start with 's1'

//     if (sections) {
//       // Check the highest existing section
//       const sectionKeys = Object.keys(sections);
//       sectionKeys.forEach(key => {
//         const sectionNumber = parseInt(key.replace('s', ''), 10);
//         if (sectionNumber >= nextSectionIndex) {
//           nextSectionIndex = sectionNumber + 1;
//         }
//       });
//     }

//     // Generate the next section name (s[i+1])
//     const nextSection = `s${nextSectionIndex}`;

//     // Save data to the next available section
//     db.ref(`sef/${bioBankId}/${nextSection}/${timestamp}`).set(data)
//       .then(() => {
//         alert('Form submitted successfully to ' + nextSection);
//       })
//       .catch((error) => {
//         console.error('Error writing to Firebase', error);
//       });
//   });
// }



// function validateForm() {
//   const data = {
//     ie: {
//       ag: document.getElementById('patAge').value,
//       sx: document.querySelector('input[name="customRadio"]:checked').value,
//       ct: document.querySelector('input[name="radioCancerType"]:checked').value,
//       tpr: document.querySelector('input[name="customProcedure"]:checked').value,
//       dpr: document.getElementById('procedureDetail').value,
//       srn: document.getElementById('surgeonName').value,
//       ss: document.querySelector('input[name="specimenSample"]:checked').value,
//       nft: document.getElementById('ft_tubes').value,
//       nfn: document.getElementById('fn_tubes').value,
//       bs: document.querySelector('input[name="bloodSample"]:checked').value,
//       bpg: document.getElementById('PlasmagridNo').value,
//       bsg: document.getElementById('SerumgridNo').value,
//       bbcg: document.getElementById('bufferCoatgridNo').value,
//       osmp: document.querySelector('input[name="otherSample"]:checked').value,
//       osg: document.getElementById('OSgridNo').value,
//       osdsc: document.getElementById('otSampleDesc').value,
//       mts: document.querySelector('input[name="MetastasisSample"]:checked').value,
//       cnst: document.querySelector('input[name="customConsent"]:checked').value,
//       iss: document.querySelector('input[name="IschemicRadio"]:checked').value,
//       prb: document.getElementById('processedBy').value,
//       scpt: document.querySelector('input[name="processedRadio"]:checked').value,
//       srt: document.getElementById('sampleReceivedTime').value,
//       spt: document.getElementById('sampleProcessedTime').value,
//       brt: document.getElementById('bloodSampleReceivedTime').value,
//       bpt: document.getElementById('bloodSampleProcessedTime').value,
//       sprt: document.getElementById('SpecimenSampleReceivedTime').value,
//       sppt: document.getElementById('SpecimenSampleProcessedTime').value,
//       osrt: document.getElementById('OtherSampleReceivedTime').value,
//       ospt: document.getElementById('OtherSampleProcessedTime').value,
//       sef_ub: 'currentUser'
//     },
//     md: {
//       fhc: document.querySelector('input[name="RadioFHabit"]:checked').value || "",
//       fhcr: document.getElementById('familyRelation').value || "",
//       fhct: document.getElementById('familyCancerType').value || "",
//       fh: document.querySelector('input[name="RadioFdHabit"]:checked').value || "",
//       hac: document.querySelector('input[name="RadioAlcoholHabit"]:checked').value || "",
//       hs: document.querySelector('input[name="RadioSmokeHabit"]:checked').value || "",
//       ec: document.querySelector('input[name="ECH"]:checked').value || "",
//       ecm: document.getElementById('comorbidityMedications').value || "",
//       ffqc: document.getElementById('ffQcComments').value || "",
//       ftr: document.getElementById('ffTissueRemarks').value || "",
//       ts: document.getElementById('tumorSite').value || "",
//       tp: document.getElementById('tumorPercentage').value || "",
//       ad: document.getElementById('ageAtDiagnosis').value || "",
//       cs: document.getElementById('clinicalStage').value || "",
//       ihcm: document.querySelector('input[name="ihcMarkerStatus"]:checked').value || "",
//       ihcd: document.getElementById('ihcMarkerDescription').value || "",
//       gt: document.querySelector('input[name="geneticTesting"]:checked').value || "",
//       gtd: document.getElementById('geneticTestingDescription').value || "",
//       pst: document.getElementById('bioBankId').value || "",
//       gd: document.getElementById('grade').value || "",
//       fc: document.querySelector('input[name="focality"]:checked').value || "",
//       lvi: document.querySelector('input[name="lvi"]:checked').value || "",
//       pni: document.querySelector('input[name="pni"]:checked').value || "",
//       ptnm: document.getElementById('ptnm').value || "",
//       as: document.getElementById('ajccStaging').value || "",
//       nnt: document.getElementById('nodesTested').value || "",
//       npn: document.getElementById('positiveNodes').value || "",
//       ts: document.getElementById('tumorSize').value || "",
//       dm: document.querySelector('input[name="denovoMetastasis"]:checked').value || "",
//       mpt: document.querySelector('input[name="metastasisPostTreatment"]:checked').value || "",
//       btn: document.getElementById('biopsyTissueNumber').value || "",
//       bd: document.getElementById('biopsyDate').value || "",
//       nact: document.querySelector('input[name="nact"]:checked').value || "",
//       nactdc: document.getElementById('nactDrugCycles').value || "",
//       nactdlc: document.getElementById('nactDateLastCycle').value || "",
//       stn: document.getElementById('surgeryTissueNumber').value || "",
//       sd: document.getElementById('surgeryDate').value || "",
//       rcbs: document.getElementById('rcbScores').value || "",
//       act: document.querySelector('input[name="act"]:checked').value || "",
//       actdc: document.getElementById('actDrugCycles').value || "",
//       actdls: document.getElementById('actDateLastCycle').value || "",
//       rd: document.querySelector('input[name="radiotherapy"]:checked').value || "",
//       rdd: document.getElementById('radiotherapyDetails').value || "",
//       rtdls: document.getElementById('radiotherapyLastCycleDate').value || "",
//       mdu: 'currentUser',
//       ipba: document.querySelector('input[name="isParaffinBlockAvailable"]:checked').value || ""
//     },
//     brf: {
//       am: document.getElementById('ageAtMenarche').value || "",
//       pty: document.getElementById('parity').value || "",
//       noc: document.getElementById('numChild').value || "",
//       afc:document.getElementById('ageAtFirstChild').value || "",
//       bf:document.querySelector('input[name="breFd"]:checked').value || "",
//       dbf: document.getElementById('dbf').value || "",
//       ms: document.querySelector('input[name="mStatus"]:checked').value || "",
//       ad: document.getElementById('ad').value || "",
//       er:  document.querySelector('input[name="ERRadio"]:checked').value || "",
//       pr:  document.querySelector('input[name="PRRadio"]:checked').value || "",
//       h2:  document.querySelector('input[name="HER2Radio"]:checked').value || "",
//       sbt: document.getElementById('sbt').value || "",
//       k67: document.getElementById('k67').value || "",
//       cs: document.getElementById('ClinicalS').value || "",
//       ht: document.getElementById('HistologicalS').value || "",
//       sps: document.getElementById('sps').value || ""
//     }
//   };
// }



function validateAndCollectData() {
  const form1Data = validateForm1();
  const form2Data = validateForm2();
  const form3Data = validateForm3();

  if (form1Data && form2Data && form3Data) {
    const data = {
      ie: form1Data.ie,
      md: form2Data.md,
      brf: form3Data.brf
    };

    const updateMode = new URLSearchParams(window.location.search).get('update');
    if (updateMode === 'true') {
      updateToFirebase(data);
    } else {
      saveToFirebase(data);
    }

    if (form1Data.ie.bpg !== "") {
      updateBB(form1Data.ie.bpg, "Plasma");
    }
    if (form1Data.ie.bsg !== "") {
      updateBB(form1Data.ie.bsg, "Serum");
    }
    if (form1Data.ie.bbcg !== "") {
      updateBB(form1Data.ie.bbcg, "Buffy Coat");
    }
    if (form1Data.ie.osg !== "") {
      updateBB(form1Data.ie.osg, "Other");
    }

    if (form1Data.ie.ftg !== "") {
      updateSB(form1Data.ie.ftg, "FT-1");
    }
    if (form1Data.ie.fng !== "") {
      updateSB(form1Data.ie.fng, "FN-1");
    }

    patients();
    return data;
  } else {
    return null;
  }
}

// function validateAndCollectData() {
//     const form1Data = validateForm1();
//     const form2Data = validateForm2();
//     const form3Data = validateForm3();

//     // Check if all forms are valid (i.e., form data is returned and not false)
//     if (form1Data && form2Data && form3Data) {
//       const data = {
//         ie: form1Data.ie,
//         md: form2Data.md,
//         brf: form3Data.brf
//       };
//       // if (update==='true') {
//       //   updateToFirebase(data);
//       // }
//       // else{
//         saveToFirebase(data);
//       // }

//       patients();
//       return data;
//     } else {
//       return null;
//     }
//   }


// Validate Form 1
function validateForm1() {
  const getDateAndTime = (dateId, timeId) => {
    const dateValue = document.getElementById(dateId).value;
    const timeValue = document.getElementById(timeId).value;

    if (dateValue && timeValue) {
      const dateTimeString = `${dateValue}T${timeValue}`;
      const dateTime = new Date(dateTimeString);

      if (!isNaN(dateTime.getTime())) {
        return dateTime.getTime(); // Returns timestamp in milliseconds
      }
    }
    return null; // If invalid or empty, return null
  };

  const aRtimestamp = getDateAndTime('sampleReceivedDate', 'sampleReceivedTime');
  const aPtimestamp = getDateAndTime('sampleProcessedDate', 'sampleProcessedTime');
  const bRtimestamp = getDateAndTime('bloodSampleReceivedDate', 'bloodSampleReceivedTime');
  const bPtimestamp = getDateAndTime('bloodSampleProcessedDate', 'bloodSampleProcessedTime');
  const sRtimestamp = getDateAndTime('SpecimenSampleReceivedDate', 'SpecimenSampleReceivedTime');
  const sPtimestamp = getDateAndTime('SpecimenSampleProcessedDate', 'SpecimenSampleProcessedTime');
  const oRtimestamp = getDateAndTime('OtherSampleReceivedDate', 'OtherSampleReceivedTime');
  const oPtimestamp = getDateAndTime('OtherSampleProcessedDate', 'OtherSampleProcessedTime');

  const form1Data = {
    ie: {
      ag: Number(document.getElementById('patAge').value),
      sx: document.querySelector('input[name="customRadio"]:checked').value,
      ct: document.querySelector('input[name="radioCancerType"]:checked').value,
      stc: document.querySelector('input[name="radioCancerStage"]:checked').value,
      tpr: document.querySelector('input[name="customProcedure"]:checked').value,
      dpr: document.getElementById('procedureDetail').value,
      srn: document.getElementById('surgeonName').value,
      ss: document.querySelector('input[name="specimenSample"]:checked').value === 'true' ? true : false,
      nft: Number(document.getElementById('ft_tubes').value),
      nfn: Number(document.getElementById('fn_tubes').value),
      bs: document.querySelector('input[name="bloodSample"]:checked').value === 'true' ? true : false,
      bpg: document.getElementById('PlasmagridNo').value,
      bsg: document.getElementById('SerumgridNo').value,
      bbcg: document.getElementById('bufferCoatgridNo').value,
      ftg: document.getElementById('ftgrid').value,
      fng: document.getElementById('fngrid').value,
      osmp: document.querySelector('input[name="otherSample"]:checked').value === 'true' ? true : false,
      osg: document.getElementById('OSgridNo').value,
      osdsc: document.getElementById('otSampleDesc').value,
      mts: document.querySelector('input[name="MetastasisSample"]:checked').value === 'true' ? true : false,
      cnst: document.querySelector('input[name="customConsent"]:checked').value === 'true' ? true : false,
      iss: document.querySelector('input[name="IschemicRadio"]:checked').value === 'true' ? true : false,
      prb: document.getElementById('processedBy').value,
      scpt: document.querySelector('input[name="processedRadio"]:checked').value === 'true' ? true : false,
      srt: aRtimestamp, // These will now either be valid timestamps or null
      spt: aPtimestamp,
      bspb: document.getElementById('BprocessedBy').value,
      brt: bRtimestamp,
      bpt: bPtimestamp,
      sspb: document.getElementById('SprocessedBy').value,
      sprt: sRtimestamp,
      sppt: sPtimestamp,
      ospb: document.getElementById('OprocessedBy').value,
      osrt: oRtimestamp,
      ospt: oPtimestamp,
      sef_ub: user
    }
  };

  return form1Data;
}


// Validate Form 2
function validateForm2() {

  let tL = document.getElementById('tumorSizeL').value;
  let tW = document.getElementById('tumorSizeW').value;
  let tH = document.getElementById('tumorSizeH').value;
  let tumorSize = `${tL}x${tW}x${tH}`;
  const form2Data = {
    md: {
      fhc: document.querySelector('input[name="RadioFHabit"]:checked')?.value === 'true' ? true : false || false,
      fhcr: document.getElementById('familyRelation').value || "",
      fhct: document.getElementById('familyCancerType').value || "",
      fh: document.querySelector('input[name="RadioFdHabit"]:checked')?.value === 'true' ? true : false || false,
      hac: document.querySelector('input[name="RadioAlcoholHabit"]:checked')?.value === 'true' ? true : false || false,
      hs: document.querySelector('input[name="RadioSmokeHabit"]:checked')?.value === 'true' ? true : false || false,
      ec: document.querySelector('input[name="ECH"]:checked')?.value === 'true' ? true : false || false,
      ecm: document.getElementById('comorbidityMedications').value || "",
      ffqc: document.getElementById('ffQcComments').value || "",
      ftr: document.getElementById('ffTissueRemarks').value || "",
      tst: document.querySelector('input[name="tumorSite"]:checked')?.value || "",
      tp: Number(document.getElementById('tumorPercentage').value) || 0,
      ad: Number(document.getElementById('ageAtDiagnosis').value) || 0,
      cs: document.getElementById('clinicalStage')?.value || "",
      ihcm: document.querySelector('input[name="IHC"]:checked')?.value === 'true' ? true : false || false,
      ihcd: document.getElementById('IHC_Description')?.value || "",
      gt: document.querySelector('input[name="GeneticT"]:checked')?.value === 'true' ? true : false || false,
      gtd: document.getElementById('GT_Description')?.value || "",
      pst: document.getElementById('subtype').value || "",
      gd: document.getElementById('sampleGrade').value || "",
      fc: document.querySelector('input[name="focal"]:checked')?.value === 'true' ? true : false || false,
      lvi: document.querySelector('input[name="LVI"]:checked')?.value === 'true' ? true : false || false,
      pni: document.querySelector('input[name="PNI"]:checked')?.value === 'true' ? true : false || false,
      ptnm: document.getElementById('pTNM')?.value || "",
      as: document.getElementById('AJCC').value || "",
      nnt: Number(document.getElementById('nodesTested').value) || 0,
      npn: Number(document.getElementById('positiveNodes').value) || 0,
      tsz: tumorSize,
      dm: document.querySelector('input[name="denovo"]:checked')?.value === 'true' ? true : false || false,
      mpt: document.querySelector('input[name="MPT"]:checked')?.value === 'true' ? true : false || false,
      btn: document.getElementById('btHPEInput').value || "",
      bd: document.getElementById('biopsyDate').value || "",
      nact: document.querySelector('input[name="NACT"]:checked')?.value === 'true' ? true : false || false,
      nactdc: document.getElementById('NACT_cycle').value || "",
      nactdlc: document.getElementById('NACT_cycle_D').value || "",
      stn: document.getElementById('StHPEInput').value || "",
      sd: document.getElementById('surgeryDate').value || "",
      rcbs: Number(document.getElementById('rcbScores').value) || 0,
      act: document.querySelector('input[name="ACT"]:checked')?.value === 'true' ? true : false || false,
      actdc: document.getElementById('actDrugCycles').value || "",
      actdls: document.getElementById('actDateLastCycle').value || "",
      rd: document.querySelector('input[name="RadioT"]:checked')?.value === 'true' ? true : false || false,
      rdd: document.getElementById('radiotherapyDetails').value || "",
      rtdls: document.getElementById('radiotherapyLastCycleDate').value || "",
      mdu: user,
      ipba: document.querySelector('input[name="pbT"]:checked')?.value === 'true' ? true : false || false
    }
  };

  // // Check if all necessary fields are filled in Form 2
  // for (const key in form2Data.md) {
  //   if (!form2Data.md[key]) {
  //     alert(`Please fill in the field: ${key}`);
  //     return false;
  //   }
  // }

  return form2Data;
}

// Validate Form 3
function validateForm3() {
  const form3Data = {
    brf: {
      am: Number(document.getElementById('ageAtMenarche').value) || 0,
      pty: Number(document.getElementById('parity').value) || 0,
      noc: Number(document.getElementById('numChild').value) || 0,
      afc: Number(document.getElementById('ageAtFirstChild').value) || 0,
      bf: document.querySelector('input[name="breFd"]:checked')?.value === 'true' ? true : false || false,
      dbf: document.getElementById('dbf').value || "",
      ms: document.querySelector('input[name="mStatus"]:checked')?.value || "",
      ad: Number(document.getElementById('ad').value) || 0,
      er: document.querySelector('input[name="ERRadio"]:checked')?.value === 'true' ? true : false || false,
      pr: document.querySelector('input[name="PRRadio"]:checked')?.value === 'true' ? true : false || false,
      h2: document.querySelector('input[name="HER2Radio"]:checked')?.value === 'true' ? true : false || false,
      sbt: document.getElementById('sbt').value || "",
      k67: Number(document.getElementById('k67').value) || 0,
      cs: document.getElementById('ClinicalS').value || "",
      ht: document.getElementById('HistologicalS').value || "",
      sps: Number(document.getElementById('sps').value) || 0,
      brfu: user
    }
  };

  // // Check if all necessary fields are filled in Form 3
  // for (const key in form3Data.brf) {
  //   if (!form3Data.brf[key]) {
  //     alert(`Please fill in the field: ${key}`);
  //     return false;
  //   }
  // }

  return form3Data;
}

// Save data to Firebase
function saveToFirebase(data) {
  const bioBankId = document.getElementById('bioBankId').value;
  const timestamp = Math.floor(Date.now() / 1000);

  db.ref(`sef/${bioBankId}`).once('value', snapshot => {
    const sections = snapshot.val();
    let nextSectionIndex = 1;

    if (sections) {
      const sectionKeys = Object.keys(sections);
      sectionKeys.forEach(key => {
        const sectionNumber = parseInt(key.replace('s', ''), 10);
        if (sectionNumber >= nextSectionIndex) {
          nextSectionIndex = sectionNumber + 1;
        }
      });
    }

    const nextSection = `s${nextSectionIndex}`;

    const formattedData = {
      ie: data.ie,
      md: data.md,
      brf: data.brf
    };

    db.ref(`sef/${bioBankId}/${nextSection}/${timestamp}`).set(data)
      .then(() => {
        alert('Form submitted successfully to ' + nextSection);
      })
      .catch((error) => {
        console.error('Error writing to Firebase', error);
      });


    const mrnData = document.getElementById('mrnNo').value;
    db.ref(`bbnmrn/${mrnData}`).set(bioBankId)
      .then(() => {
        console.log('stored in bbnmrn');
      })
      .catch((error) => {
        console.log('Not stored in bbnmrn');
      });

  });

  const dueDate = new Date();
  // dueDate.setMonth(dueDate.getMonth() + 6);  // Add 6 months to the current date
  dueDate.setMinutes(dueDate.getMinutes() + 3);  // Optionally, add extra minutes if needed

  const bioBankPath = `pfw/${bioBankId}`;
  console.log("dueDate", dueDate);  // Logs the correct Date object

  db.ref(bioBankPath).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log('Path already exists. Not storing in pfw.');
      } else {
        // Convert the dueDate to a timestamp before storing
        db.ref(bioBankPath).set(dueDate.getTime())  // Store as Unix timestamp (milliseconds since 1970)
          .then(() => {
            console.log('Stored in pfw');
          })
          .catch((error) => {
            console.log('Error storing in pfw:', error);
          });
      }
    })
    .catch((error) => {
      console.log('Error checking path existence:', error);
    });
}




function patients() {
  const bioBankId = document.getElementById('bioBankId').value;
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp

  let smtyArray = [];
  const bloodSampleSelected = document.getElementById('bloodSampleY').checked;
  const specimenSampleSelected = document.getElementById('specimenSampleY').checked;
  const otherSampleSelected = document.getElementById('otherSampleY').checked;

  if (bloodSampleSelected) smtyArray.push('B');
  if (specimenSampleSelected) smtyArray.push('S');
  if (otherSampleSelected) smtyArray.push('O');

  // Join the selected samples into a single string (e.g., "B,S,O")
  const smty = smtyArray.join(',');

  db.ref(`Patients/${bioBankId}`).once('value', snapshot => {
    const sections = snapshot.val();
    let nextSectionIndex = 1; // Start with 's1'

    if (sections) {
      // Check the highest existing section
      const sectionKeys = Object.keys(sections);
      sectionKeys.forEach(key => {
        const sectionNumber = parseInt(key.replace('s', ''), 10);
        if (sectionNumber >= nextSectionIndex) {
          nextSectionIndex = sectionNumber + 1;
        }
      });
    }

    // Generate the next section name (s[i+1])
    const nextSection = `s${nextSectionIndex}`;

    // Get the data from the form inputs
    const patientInfo = {
      age: document.getElementById('patAge').value, // Assuming 'patAge' is the age input field
      gndr: document.querySelector('input[name="customRadio"]:checked').value, // Gender
      ct: document.querySelector('input[name="radioCancerType"]:checked').value, // Type of Cancer
      stc: document.querySelector('input[name="radioCancerStage"]:checked').value, // Stage of Cancer
      grc: document.getElementById('sampleGrade')?.value || "", // Grade of Cancer
      smty: smty || "",
      typ: document.querySelector('input[name="customProcedure"]:checked').value, // Type of Procedure
      ts: timestamp
    };

    // Save the structured data to the next available section with the timestamp
    db.ref(`Patients/${bioBankId}/${nextSection}`).set(patientInfo)
      .then(() => {
        alert('Patient info submitted successfully to ' + nextSection);
      })
      .catch((error) => {
        console.error('Error writing to Firebase', error);
      });

    const mrnData = document.getElementById('mrnNo').value; // If you need to handle MRN number as well

  });
}



// document.addEventListener('DOMContentLoaded', function () {
//   // Get the patient data from localStorage
//   const patientDataStr = localStorage.getItem('patientData');

//   // Check if the data exists and is not null or empty
//   if (patientDataStr) {
//     try {
//       // Parse the data and handle it
//       const patientData = JSON.parse(patientDataStr);

//       if (patientData) {
//         // Fill in the input fields with patient data
//         document.getElementById('patAge').value = patientData.ag || '';
//         document.querySelector(`input[name="customRadio"][value="${patientData.sx}"]`).checked = true;
//         document.querySelector(`input[name="radioCancerType"][value="${patientData.ct}"]`).checked = true;
//         document.querySelector(`input[name="radioCancerStage"][value="${patientData.stc}"]`).checked = true;
//         document.querySelector(`input[name="customProcedure"][value="${patientData.tpr}"]`).checked = true;
//         document.getElementById('procedureDetail').value = patientData.dpr || '';
//         document.getElementById('surgeonName').value = patientData.srn || '';
//         document.querySelector(`input[name="specimenSample"][value="${patientData.ss}"]`).checked = true;
//         document.getElementById('ft_tubes').value = patientData.nft || '';
//         document.getElementById('fn_tubes').value = patientData.nfn || '';
//         document.querySelector(`input[name="bloodSample"][value="${patientData.bs}"]`).checked = true;
//         document.getElementById('PlasmagridNo').value = patientData.bpg || '';
//         document.getElementById('SerumgridNo').value = patientData.bsg || '';
//         document.getElementById('bufferCoatgridNo').value = patientData.bbcg || '';
//         document.querySelector(`input[name="otherSample"][value="${patientData.osmp}"]`).checked = true;
//         document.getElementById('OSgridNo').value = patientData.osg || '';
//         document.getElementById('otSampleDesc').value = patientData.osdsc || '';
//         document.querySelector(`input[name="MetastasisSample"][value="${patientData.mts}"]`).checked = true;
//         document.querySelector(`input[name="customConsent"][value="${patientData.cnst}"]`).checked = true;
//         document.querySelector(`input[name="IschemicRadio"][value="${patientData.iss}"]`).checked = true;
//         document.getElementById('processedBy').value = patientData.prb || '';
//         document.querySelector(`input[name="processedRadio"][value="${patientData.scpt}"]`).checked = true;
//         document.getElementById('sampleReceivedTime').value = patientData.srt || '';
//         document.getElementById('sampleProcessedTime').value = patientData.spt || '';
//         document.getElementById('bloodSampleReceivedTime').value = patientData.brt || '';
//         document.getElementById('bloodSampleProcessedTime').value = patientData.bpt || '';
//         document.getElementById('SpecimenSampleReceivedTime').value = patientData.sprt || '';
//         document.getElementById('SpecimenSampleProcessedTime').value = patientData.sppt || '';
//         document.getElementById('OtherSampleReceivedTime').value = patientData.osrt || '';
//         document.getElementById('OtherSampleProcessedTime').value = patientData.ospt || '';
//         const inputs = document.querySelectorAll('input, select, textarea');
//         inputs.forEach(input => {
//           input.disabled = true;
//         });
//       }
//     } catch (e) {
//       console.error("Error parsing patient data from localStorage:", e);
//     }
//   }
//   // Disable all input fields


// });

const upUrlParams = new URLSearchParams(window.location.search);
const update = upUrlParams.get('upadte');



function pages_display(mode, bioBankId, seq, timestampKey) {
  console.log("mode", mode);
  console.log("bioBankId", bioBankId);
  console.log("seq", seq);
  console.log("timestampKey", timestampKey);

  if (seq != '') {
    var dataPath = `sef/${bioBankId}/${seq}/${timestampKey}`;
  }
  else {
    var dataPath = `Fw/${bioBankId}/${timestampKey}`;
  }
  console.log("datapath", dataPath);
  console.log("DataConfig", db);

  localStorage.setItem('bioid', bioBankId);
  localStorage.setItem('mode', mode)


  if (mode != "") {
    console.log('dataPath', dataPath);
    db.ref(dataPath).once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched data:", data);
          sessionStorage.setItem('formData', JSON.stringify(data));
          const storedData = sessionStorage.getItem('formData');
          if (storedData) {
            const parsedData = JSON.parse(storedData); // Convert it back to an object
            console.log('parsedData', parsedData); // Print the data to the console
          } else {
            console.log('No formData found in sessionStorage');
          }
          // Handle different modes
          switch (mode) {
            case 'SearchView':
            case 'PendingView':
              localStorage.setItem("selectedGrid", "");
              window.location.href = `default.html?hideMnrId=true`;
              break;
            case 'SearchEdit':
            case 'PendingEdit':
              localStorage.setItem("selectedGrid", "");
              window.location.href = `default.html?update=true`;
              break;
            case 'EditFollowUps':
              localStorage.setItem("selectedGrid", "");
              window.location.href = `default.html?mode=edit`;
              break;
            case 'ViewFollowUps':
              localStorage.setItem("selectedGrid", "");
              window.location.href = `default.html?mode=view`;
              break;
            default:
              console.error('Unknown mode:', mode);
          }
        } else {
          console.error('No data found at the specified path');
          // Optionally, redirect or display a message to the user
        }
      }).catch(error => {
        console.error("Error fetching data:", error);
      });
  }
  else if (mode === "") {
    localStorage.setItem("selectedGrid", "");
    window.location.href = "default.html";
  }
}


function fillIeForm(ieData) {
  const bioid = localStorage.getItem('bioid')
  console.log("bibioBankId", bioid);
  document.getElementById('bioBankId').value = bioid;
  document.getElementById('patAge').value = ieData.ag || '';
  document.querySelector(`input[name="customRadio"][value="${ieData.sx}"]`).checked = true || '';
  document.querySelector(`input[name="radioCancerType"][value="${ieData.ct}"]`).checked = true || '';
  document.querySelector(`input[name="radioCancerStage"][value="${ieData.stc}"] `).checked = true || '';
  document.querySelector(`input[name="customProcedure"][value="${ieData.tpr}"]`).checked = true;
  document.getElementById('procedureDetail').value = ieData.dpr || '';
  document.getElementById('surgeonName').value = ieData.srn;
  console.log("surgeonName", ieData.srn)
  document.querySelector(`input[name="specimenSample"][value="${ieData.ss}"]`).checked = true;
  document.getElementById('ft_tubes').value = ieData.nft || '';
  document.getElementById('ftgrid').value = ieData.ftg || '';
  document.getElementById('fngrid').value = ieData.fng || '';
  document.getElementById('fn_tubes').value = ieData.nfn || '';
  document.querySelector(`input[name="bloodSample"][value="${ieData.bs}"]`).checked = true;
  document.getElementById('PlasmagridNo').value = ieData.bpg || '';
  document.getElementById('SerumgridNo').value = ieData.bsg || '';
  document.getElementById('bufferCoatgridNo').value = ieData.bbcg || '';
  document.querySelector(`input[name="otherSample"][value="${ieData.osmp}"]`).checked = true;
  document.getElementById('OSgridNo').value = ieData.osg || '';
  document.getElementById('otSampleDesc').value = ieData.osdsc || '';
  document.querySelector(`input[name="MetastasisSample"][value="${ieData.mts}"]`).checked = true;
  document.querySelector(`input[name="customConsent"][value="${ieData.cnst}"]`).checked = true;
  document.querySelector(`input[name="IschemicRadio"][value="${ieData.iss}"]`).checked = true;
  document.getElementById('processedBy').value = ieData.prb || '';
  document.querySelector(`input[name="processedRadio"][value="${ieData.scpt}"]`).checked = true;
  document.getElementById('BprocessedBy').value = ieData.bspb || '';
  document.getElementById('SprocessedBy').value = ieData.sspb || '';
  document.getElementById('OprocessedBy').value = ieData.ospb || '';

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    const dateObj = new Date(timestamp);
    const date = dateObj.toISOString().split('T')[0];
    const time = dateObj.toTimeString().split(' ')[0];
    return { date, time };
  };

  // Populate form fields with date and time
  const srt = formatTimestamp(ieData.srt);
  document.getElementById('sampleReceivedDate').value = srt.date;
  document.getElementById('sampleReceivedTime').value = srt.time;

  const spt = formatTimestamp(ieData.spt);
  document.getElementById('sampleProcessedDate').value = spt.date;
  document.getElementById('sampleProcessedTime').value = spt.time;

  const brt = formatTimestamp(ieData.brt);
  document.getElementById('bloodSampleReceivedDate').value = brt.date;
  document.getElementById('bloodSampleReceivedTime').value = brt.time;

  const bpt = formatTimestamp(ieData.bpt);
  document.getElementById('bloodSampleProcessedDate').value = bpt.date;
  document.getElementById('bloodSampleProcessedTime').value = bpt.time;

  const sprt = formatTimestamp(ieData.sprt);
  document.getElementById('SpecimenSampleReceivedDate').value = sprt.date;
  document.getElementById('SpecimenSampleReceivedTime').value = sprt.time;

  const sppt = formatTimestamp(ieData.sppt);
  document.getElementById('SpecimenSampleProcessedDate').value = sppt.date;
  document.getElementById('SpecimenSampleProcessedTime').value = sppt.time;

  const osrt = formatTimestamp(ieData.osrt);
  document.getElementById('OtherSampleReceivedDate').value = osrt.date;
  document.getElementById('OtherSampleReceivedTime').value = osrt.time;

  const ospt = formatTimestamp(ieData.ospt);
  document.getElementById('OtherSampleProcessedDate').value = ospt.date;
  document.getElementById('OtherSampleProcessedTime').value = ospt.time;
}

function fillMdForm(mdData) {
  document.querySelector(`input[name="RadioFHabit"][value="${mdData.fhc}"]`).checked = true;
  document.getElementById('familyRelation').value = mdData.fhcr || '';
  document.getElementById('familyCancerType').value = mdData.fhct || '';
  document.querySelector(`input[name="RadioFdHabit"][value="${mdData.fh}"]`).checked = true;
  document.querySelector(`input[name="RadioAlcoholHabit"][value="${mdData.hac}"]`).checked = true;
  document.querySelector(`input[name="RadioSmokeHabit"][value="${mdData.hs}"]`).checked = true;
  document.querySelector(`input[name="ECH"][value="${mdData.ec}"]`).checked = true;
  document.getElementById('comorbidityMedications').value = mdData.ecm || '';
  document.getElementById('ffQcComments').value = mdData.ffqc || '';
  document.getElementById('ffTissueRemarks').value = mdData.ftr || '';
  document.querySelector(`input[name="tumorSite"][value="${mdData.tst}"]`).checked = true;
  document.getElementById('tumorPercentage').value = mdData.tp || '';
  document.getElementById('ageAtDiagnosis').value = mdData.ad || '';
  document.getElementById('clinicalStage').value = mdData.cs || '';
  document.querySelector(`input[name="IHC"][value="${mdData.ihcm}"]`).checked = true;
  document.getElementById('IHC_Description').value = mdData.ihcd || '';
  document.querySelector(`input[name="GeneticT"][value="${mdData.gt}"]`).checked = true;
  document.getElementById('GT_Description').value = mdData.gtd || '';
  document.getElementById('subtype').value = mdData.pst || '';
  document.getElementById('sampleGrade').value = mdData.gd || '';
  document.querySelector(`input[name="focal"][value="${mdData.fc}"]`).checked = true;
  document.querySelector(`input[name="LVI"][value="${mdData.lvi}"]`).checked = true;
  document.querySelector(`input[name="PNI"][value="${mdData.pni}"]`).checked = true;
  document.getElementById('pTNM').value = mdData.ptnm || '';
  document.getElementById('AJCC').value = mdData.as || '';
  document.getElementById('nodesTested').value = mdData.nnt || '';
  document.getElementById('positiveNodes').value = mdData.npn || '';
  if (mdData.tsz) {
    const [tL, tW, tH] = mdData.tsz.split('x');

    document.getElementById('tumorSizeL').value = tL;
    document.getElementById('tumorSizeW').value = tW;
    document.getElementById('tumorSizeH').value = tH;
  }
  document.querySelector(`input[name="denovo"][value="${mdData.dm}"]`).checked = true;
  document.querySelector(`input[name="MPT"][value="${mdData.mpt}"]`).checked = true;
  document.getElementById('btHPEInput').value = mdData.btn || '';
  document.getElementById('biopsyDate').value = mdData.bd || '';
  document.querySelector(`input[name="NACT"][value="${mdData.nact}"]`).checked = true;
  document.getElementById('NACT_cycle').value = mdData.nactdc || '';
  document.getElementById('NACT_cycle_D').value = mdData.nactdlc || '';
  document.getElementById('StHPEInput').value = mdData.stn || '';
  document.getElementById('surgeryDate').value = mdData.sd || '';
  document.getElementById('rcbScores').value = mdData.rcbs || '';
  document.querySelector(`input[name="ACT"][value="${mdData.act}"]`).checked = true;
  document.getElementById('actDrugCycles').value = mdData.actdc || '';
  document.getElementById('actDateLastCycle').value = mdData.actdls || '';
  document.querySelector(`input[name="RadioT"][value="${mdData.rd}"]`).checked = true;
  document.getElementById('radiotherapyDetails').value = mdData.rdd || '';
  document.getElementById('radiotherapyLastCycleDate').value = mdData.rtdls || '';
  document.querySelector(`input[name="pbT"][value="${mdData.ipba}"]`).checked = true;
  document.getElementById('processedBy').value = mdData.mdu || 'currentUser';
}


function fillBrfForm(brfData) {
  document.getElementById('ageAtMenarche').value = brfData.am || '';
  document.getElementById('parity').value = brfData.pty || '';
  document.getElementById('numChild').value = brfData.noc || '';
  document.getElementById('ageAtFirstChild').value = brfData.afc || '';
  document.querySelector(`input[name="breFd"][value="${brfData.bf}"]`).checked = true;
  document.getElementById('dbf').value = brfData.dbf || '';
  document.querySelector(`input[name="mStatus"][value="${brfData.ms}"]`).checked = true;

  document.getElementById('ad').value = brfData.ad || '';
  document.querySelector(`input[name="ERRadio"][value="${brfData.er}"]`).checked = true;
  document.querySelector(`input[name="PRRadio"][value="${brfData.pr}"]`).checked = true;
  document.querySelector(`input[name="HER2Radio"][value="${brfData.h2}"]`).checked = true;
  document.getElementById('sbt').value = brfData.sbt || '';
  document.getElementById('k67').value = brfData.k67 || '';
  document.getElementById('ClinicalS').value = brfData.cs || '';
  document.getElementById('HistologicalS').value = brfData.ht || '';
  document.getElementById('sps').value = brfData.sps || '';
  document.getElementById('processedBy').value = brfData.brfu || 'currentUser';
}

function updateToFirebase(data) {
  const bioBankId = document.getElementById('bioBankId').value;
  const timestamp = Math.floor(Date.now() / 1000);

  console.log("Hi Bhanu")

  db.ref(`sef/${bioBankId}`).once('value', snapshot => {
    const sections = snapshot.val();

    if (sections) {
      const sectionKeys = Object.keys(sections);
      const lastSection = sectionKeys[sectionKeys.length - 1];
      const formattedData = {
        ie: data.ie,
        md: data.md,
        brf: data.brf
      };

      db.ref(`sef/${bioBankId}/${lastSection}/${timestamp}`).set(formattedData)
        .then(() => {
          alert('Form submitted successfully to ' + lastSection);
        })
        .catch((error) => {
          console.error('Error writing to Firebase', error);
        });

    } else {
      const firstSection = `s1`;

      db.ref(`sef/${bioBankId}/${firstSection}/${timestamp}`).set(data)
        .then(() => {
          alert('Form submitted successfully to ' + firstSection);
        })
        .catch((error) => {
          console.error('Error writing to Firebase', error);
        });
    }

    const mrnData = document.getElementById('mrnNo').value;
    db.ref(`bbnmrn/${mrnData}`).set(bioBankId)
      .then(() => {
        console.log('Stored in bbnmrn');
      })
      .catch((error) => {
        console.log('Not stored in bbnmrn');
      });
  });
}

// Define the submitFollowup function
function submitFollowup() {
  event.preventDefault();

  const lastFollowupStatus = document.querySelector('input[name="flexRadioDefault"]:checked').value;
  const lastFollowUpDate = document.getElementById('startInputFollow').value;
  const othrs = document.getElementById('otherR').value;
  const lostToFollowUpReason = document.getElementById('lostFollowUpID') ? document.getElementById('lostFollowUpID').value : '';
  const recurrenceDate = document.getElementById('recurrenceDate') ? document.getElementById('recurrenceDate').value : '';
  const reportedDateForProgressiveDisease = document.getElementById('reportedDate') ? document.getElementById('reportedDate').value : '';
  const vitalStatus = document.querySelector('input[name="livestatus"]:checked').value;
  const deathDate = document.getElementById('deathDate') ? document.getElementById('deathDate').value : '';
  const remarks = document.getElementById('remark').value;
  const bioBankId = localStorage.getItem('bioid');
  const timestamp = Date.now() / 1000;

  const followupData = {
    lfs: lastFollowupStatus,
    othrs: othrs,
    lfd: lastFollowUpDate,
    rlfw: lostToFollowUpReason || '',  // If not provided, set it to an empty string
    rd: recurrenceDate || '',  // If not provided, set it to an empty string
    rdpd: reportedDateForProgressiveDisease || '',  // If not provided, set it to an empty string
    pet: '',  // Assuming you have a field for PET finding that needs to be populated
    vs: vitalStatus,
    dd: deathDate || '',  // If not provided, set it to an empty string
    rmks: remarks || '',  // If not provided, set it to an empty string
    fw_ub: user,  // You can dynamically set the field worker's name here
  };

  // Firebase reference to the path you want to save the data to
  const db = firebase.database();  // Initialize Firebase database reference
  const dataPath = `Fw/${bioBankId}/${timestamp}`;

  // Push the data to Firebase
  db.ref(dataPath).set(followupData)
    .then(() => {
      console.log('Followup data saved successfully');
      alert('Follow-up information has been saved.');
    })
    .catch((error) => {
      console.error('Error saving followup data:', error);
      alert('There was an error saving the follow-up information. Please try again.');
    });
}


function updateBB(info) {
  const parts = info.split('/');
  if (parts.length !== 3) {
    console.error("Invalid data format. Expected 'box_name/seat_ids/sampleType'.");
    return;
  }
  const bioBankId = document.getElementById('bioBankId').value;

  const boxName = parts[0].trim();
  const seatList = parts[1].split(',');
  const sampleType = parts[2].trim();

  console.log("bioBankId", bioBankId);
  if (!bioBankId) {
    console.error("No bioBankId found in localStorage");
    return;
  }

  db.ref(`bb/${boxName}`).once('value')
    .then(snapshot => {
      let box = snapshot.val();

      if (!box) {
        console.error(`No box found with the name: ${boxName}`);
        return;
      }

      console.log("seatList", seatList);

      seatList.forEach(seatID => {
        seatID = seatID.trim();
        console.log("seatID", seatID);

        let seatIndex = getSeatIndex(seatID);

        if (box[seatIndex]) {
          const seatUpdate = {
            bioBankId: bioBankId,
            sampleType: sampleType,
            status: "o"
          };

          db.ref(`bb/${boxName}/${seatIndex}`).update(seatUpdate)
            .then(() => {
              console.log(`Seat ${seatID} updated successfully in Firebase.`);
            })
            .catch(error => {
              console.error(`Error updating seat ${seatID}:`, error);
            });
        }
      });
    })
    .catch(error => {
      console.error("Error fetching seat data from Firebase:", error);
    });
}

// function updateBB(info) {
//   const parts = info.split('/');
//   if (parts.length !== 3) {
//     console.error("Invalid data format. Expected 'box_name/seat_ids/sampleType'.");
//     return;
//   }
//   const bioBankId = document.getElementById('bioBankId').value;

//   const boxName = parts[0].trim();      
//   const seatList = parts[1].split(',');
//   const sampleType = parts[2].trim();

//   console.log("bioBankId",bioBankId)
//   if (!bioBankId) {
//     console.error("No bioBankId found in localStorage");
//     return;
//   }
//   let dbRef = firebase.database().ref('bb');

//     dbRef.once('value')
//     .then(snapshot => {
//       let seatData = snapshot.val();
//       let box = seatData[boxName];

//       if (!box) {
//         console.error(`No box found with the name: ${boxName}`);
//         return;
//       }

//       console.log("seatList", seatList);

//       seatList.forEach(seatID => {
//         seatID = seatID.trim();
//         console.log("seatID", seatID);
//         console.log("sampleType", sampleType);


//         let seatIndex = getSeatIndex(seatID);
//         console.log("seatIndex",seatIndex + " sampleType",sampleType + " seatID",seatID + " boxName",boxName  + " seatList",seatList);

//         if (box[seatIndex]) {
//           box[seatIndex].bioBankId = bioBankId; 
//           box[seatIndex].sampleType = sampleType; 
//           box[seatIndex].status = "o";
//         }
//         console.log("Box Data",box);



//         // db.ref(`bb/${boxName}/${seatIndex}`).set(box)
//         // .then(() => {
//         //   console.log("Seat data updated successfully in Firebase.");
//         // })
//         // .catch(error => {
//         //   console.error("Error updating seat data:", error);
//         // });


//       });
//       const bbVar =  dbRef.ref(`bb/${boxName}/${seatIndex}`);
//         // bbVar.set({
//         //   bioBankId = bioBankId ,
//         //   sampleType = sampleType,
//         //   status = "o"

//         //     });

//     })
//     .catch(error => {
//       console.error("Error fetching seat data from Firebase:", error);
//     });
// }



function getSeatIndex(seatID) {
  const rowLetter = seatID[0];   // e.g., 'B'
  const colNumber = seatID.slice(1);  // e.g., '7'

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = 10;

  const rowIndex = rows.indexOf(rowLetter);   // Get the index of the row letter
  const colIndex = parseInt(colNumber) - 1;   // Convert column number (1-based) to zero-based index

  return rowIndex * cols + colIndex;   // Calculate the seat's position in the grid
}


function updateSB(info) {
  const parts = info.split('/');
  if (parts.length !== 3) {
    console.error("Invalid data format. Expected 'box_name/seat_ids/sampleType'.");
    return;
  }

  const bioBankId = document.getElementById('bioBankId').value;

  const boxName = parts[0].trim();
  const seatList = parts[1].split(',');
  const sampleTypes = parts[2].split(',');

  console.log("bioBankId", bioBankId);
  if (!bioBankId) {
    console.error("No bioBankId found in localStorage");
    return;
  }

  db.ref(`sb/${boxName}`).once('value')
    .then(snapshot => {
      let box = snapshot.val();

      if (!box) {
        console.error(`No box found with the name: ${boxName}`);
        return;
      }

      console.log("seatList", seatList);
      console.log("sampleTypes", sampleTypes);

      if (seatList.length !== sampleTypes.length) {
        console.error("The number of seats does not match the number of sample types.");
        return;
      }

      seatList.forEach((seatID, index) => {
        seatID = seatID.trim();
        const sampleType = sampleTypes[index].trim();
        console.log("seatID", seatID, "sampleType", sampleType);

        let seatIndex = getSeatIndex(seatID);

        if (box[seatIndex]) {
          const seatUpdate = {
            bioBankId: bioBankId,
            sampleType: sampleType,
            status: "o"
          };

          db.ref(`sb/${boxName}/${seatIndex}`).update(seatUpdate)
            .then(() => {
              console.log(`Seat ${seatID} updated with sample type ${sampleType} successfully in Firebase.`);
            })
            .catch(error => {
              console.error(`Error updating seat ${seatID}:`, error);
            });
        }
      });
    })
    .catch(error => {
      console.error("Error fetching seat data from Firebase:", error);
    });
}



function retrieveFollowup(bioBankId) {
  const db = firebase.database();
  const dataPath = `Fw/${bioBankId}`;
  console.log('Path', dataPath);
  db.ref(dataPath).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const followupData = snapshot.val();
        console.log('Retrieved follow-up data:', followupData);
        const timestamps = Object.keys(followupData);
        const latestTimestamp = Math.max(...timestamps.map((t) => parseInt(t)));

        const latestData = followupData[latestTimestamp];
        displayFollowupData(latestData);
      }
      else {
        console.log('No follow-up data found for this BioBank ID.');
      }
    })
    .catch((error) => {
      console.error('Error retrieving follow-up data:', error);
      alert('There was an error retrieving the follow-up information. Please try again.');
    });
}

function displayFollowupData(data) {
  // pet: '',  // Assuming you have a field for PET finding that needs to be populated

  console.log('Displaying follow-up data:', data);
  document.querySelector(`input[name="flexRadioDefault"][value="${data.lfs}"]`).checked = true;
  document.getElementById('otherR').value = data.othrs || '';

  document.getElementById('startInputFollow').value = data.lfd || '';
  document.getElementById('lostFollowUp').value = data.rlfw || '';
  document.getElementById('recurrenceDate').value = data.rd || '';
  document.getElementById('reportedDate').value = data.rdpd || '';
  document.getElementById('PET').value = data.pet || '';

  document.querySelector(`input[name="livestatus"][value="${data.vs}"]`).checked = true;
  document.getElementById('deathDate').value = data.dd || '';
  document.getElementById('remark').value = data.rmks || '';

}
function shareDate(mode, selectedPatients) {
  // Convert the selectedPatients array into a JSON string before storing
  localStorage.setItem('selectedPatients', JSON.stringify(selectedPatients));
  localStorage.setItem('mode', mode);
  console.log("Selected patients for sharing:", selectedPatients);

  switch (mode) {
    case 'share':
      localStorage.setItem("selectedGrid", "");
      window.location.href = `default.html?shared=true`;
      break;
    default:
      console.error('Unknown mode:', mode);
  }
}

