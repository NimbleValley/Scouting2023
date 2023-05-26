const scriptPickListURL = "https://script.google.com/macros/s/AKfycbwvUpf9CMqOqlWLyW65qRk6K1_5qTTrpsgeF2cWbhIi_uwCWCS3qXcPmhs7zvnCM1XB/exec";
const pickListSync = document.getElementById("sync-pick-list-button");
const pickListForm = document.getElementById("pick-list-form");

const toFormData = (f => f(f))(h => f => f(x => h(h)(f)(x)))(f => fd => pk => d => {
    if (d instanceof Object) {
      Object.keys(d).forEach(k => {
        const v = d[k] === null ? '' : d[k] === true ? 1 : d[k] === false ? 0 : d[k]
        if (pk) k = `${pk}[${k}]`
        if (v instanceof Object && !(v instanceof Date) && !(v instanceof File)) {
          return f(fd)(k)(v)
        } else {
          fd.append(k, v)
        }
      })
    }
    return fd
  })(new FormData())()

pickListForm.addEventListener("submit",  e => {
    var formData = new FormData();
    
    formData.append("Index", 1);
    formData.append("Team Number", 930);
    formData.append("Color", 1);

    formData.append("Index", 2);
    formData.append("Team Number", 3197);
    formData.append("Color", 3);

    //Object.keys(data).forEach(key => formData.append(key, data[key]));
    for (let key of formData.keys()) {
        console.log(key, formData.getAll(key).join(','));
    }

    e.preventDefault();

    fetch(scriptPickListURL, { method: 'POST', body: formData })
        .then(response => {
            alert('Success!', response);
        })
        .catch(error => {
            alert('Terrible Error :(.', error.message);
        });
});


class PickListTeam {
    constructor(index, number, color) {
        this.index = index;
        this.number = number;
        this.color = color;
    }

    setIndex(index) {
        this.index = index;
    }

    setColor(color) {
        this.color = color;
    }

    getIndex() {
        return this.index;
    }

    getTeam() {
        return this.number;
    }

    getColor() {
        return this.color;
    }
}