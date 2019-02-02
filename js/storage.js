const start_v0 = 0;
const start_koeff = 3.13E-4;

Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  return JSON.parse(this.getItem(key));
}


if(!localStorage.getItem('AO01')) {
  initStorage();
}

function initStorage() {
  localStorage.setObject('AO01', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO02', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO03', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO04', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO05', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO06', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO07', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO08', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO09', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO10', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO11', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO12', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO13', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO14', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO15', {v0: start_v0, koeff: start_koeff});
  localStorage.setObject('AO16', {v0: start_v0, koeff: start_koeff});
}

function saveToLocalStorage(data) {
  for (let aOut in data){
    localStorage.setObject(aOut, {v0: data[aOut].v0, koeff: data[aOut].koeff})
  }
}
