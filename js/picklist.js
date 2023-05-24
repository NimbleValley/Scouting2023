class PickListTeam {
    constructor(index, number, color) {
      this.index = index;
      this.number = number;
      this.color = color;
    }

    updateIndex(index) {
        this.index = index;
    }

    updateColor(color) {
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