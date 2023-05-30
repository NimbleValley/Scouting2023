const scriptPickListURL = "https://script.google.com/macros/s/AKfycbxpG_KDd0WtiQEjHKmSfUsTYCe1RvOYxp3wYv83hCpWYNRbk7F6WHLl2JoPgvcxQVqB/exec";
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
    var indexes = [];
    var numbers = [];
    var colors = [];
    for(var i = 0; i < PICK_LIST_OBJECTS.length; i ++) {
        indexes[i] = PICK_LIST_OBJECTS[i].getIndex();
        numbers[i] = PICK_LIST_OBJECTS[i].getTeam();
        colors[i] = PICK_LIST_OBJECTS[i].getColor();
    }
    
    formData.append("Index", indexes);
    formData.append("Team Number", numbers);
    formData.append("Color", colors);
    

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
        return parseInt(this.number);
    }

    getColor() {
        return this.color;
    }
}