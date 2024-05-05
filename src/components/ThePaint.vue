<template>
  <div class="the-home">
    <div class="cover">
      <div class="cover__2">
        <div class="menu" id="menu">
          <select class="brash" v-model="selectedOptionSize">
            <option v-for="value in selectedOptionSizeArr" :key="value" :value="value">{{ value }}</option>
          </select>
          <select class="figures" v-model="selectedType">
            <option class="figures__img" v-for="value in selectedTypeArr" :key="value" :value="value">{{ value }}
            </option>
          </select>
          <button class="lastick" @click="reset()"></button>
          <button class="import" @click="sevedImage"></button>
          <button @click="resetImg()">стереть картинку</button>
          <input type="file" @change="uploadImage" accept="image/*">
        </div>

        <canvas ref="canvas" id="MyCanvas" @mousemove="draw" @mousedown="beginDrawing" @mouseup="stopDrawing"
          width="760" height="460">
        </canvas>

        <div class="color__palettes">
          <div class="color__row" v-for="(row, rowIndex) in selectedColorArr" :key="rowIndex">
            <div @click="selectColor(item)" class="color__item" v-for="(item, colIndex) in row"
              :style="{ backgroundColor: item }" :key="colIndex"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // name: 'ThePaint',
  data() {
    return {
      canvas: null,
      ctx: null,
      x: 0,
      y: 0,
      isDrawing: false,
      selectedOptionSizeArr: [
        12, 14, 16, 18, 200
      ],
      selectedOptionSize: 1,
      selectedColorArr: [
        ['#172730', '#32475F', '#3E5D71', '#405977', '#694A6C', '#804DA3', '#505EBC', '#5570B8', '#933737', '#B94767', '#814486', '#824D95','#983739', '#BA4367', '#7E4089', '#825198'],
        ["#CAD2CC", '#DEDBD0', '#DEDBD0', '#F3E8CA', '#C3CCCC', '#E0E1D9', '#E0E1D9', '#E0E1D9','#E0E1D9', '#E0E1D9', '#BED1D4', '#BDCECD', '#76AEC9', '#79BFCC', '#6FC0CC', '#6EB7D9'],
        ['#898493', '#BB91A5', '#F37F96', '#EA7E7C','#87888F', '#C598AB', '#F992A2', '#F88587', '#5D7B97', '#87949D', '#D1A393', '#BA8175', '#4C7495', '#6B8CA4', '#ABA7A0', '#978786'],
        ['#E88C84', '#DE818D', '#F4504E', '#E1484D', '#D68D8C', '#EF7F9B', '#DF5A5B', '#DC404B', '#87929D', '#B28C93', '#B28C93', '#CE505C','#4B81A3', '#57899C', '#958480', '#8C7076'],
        ['#386060', '#5DA982', '#72BDA7', '#5FC2AA', '#B0836D', '#DA8F43', '#F48D4E', '#EF8928','#B57C76', '#E37F79', '#DD7F61', '#E97651', '#C39399', '#E67795', '#E0677E', '#E5506C'],
        ['#E3A15A', '#EEB170', '#EFC8A1', '#E8CAAF','#DE9047', '#E5AA51', '#F0C293', '#E7D8C1', '#93755D', '#A28267', '#BB9C82', '#C8BFAF', '#6891AB', '#6C99B4', '#83A8BA', '#A4BBC0'],
        ['#C0DBCF', '#CEE4D5', '#E6EFDB', '#DAE2C5', '#BED8DB', '#CDE4DB', '#D9E8DE', '#D8E5D4', '#6AD1DD', '#A5DAD7', '#AFD7D1', '#B1CECD','#49CECD', '#71CFD2', '#6CCAD3', '#70BCCB'],
        ['#927F88', '#D48899', '#DC7A71', '#C57F6C', '#958A89', '#CD99A4', '#E78175', '#BF7875','#697C8D', '#B99890', '#AC766F', '#818287', '#677F95', '#79969B', '#8A7E80', '#427089']
      ],
      selectedColor: "black",
      selectedType: "карандаш",
      selectedTypeArr: ["прямоугольник", "круг", "треугольник", "карандаш"],
      savedFigures: [],
      img: null

    }
  },
  mounted() {
    const c = this.$refs.canvas;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    this.canvas = document.getElementById('MyCanvas');
  },

  methods: {
    sevedImage() {
      let img = new Image();
      img.src = this.img;

      this.ctx.drawImage(img, 0, 0);

      this.redrawSaved()

      const dataURL = this.canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = dataURL;
      a.download = this.generateRandomName(8) + '.jpg';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    generateRandomName(length) {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
      }

      return result;
    },

    selectColor(color) {
      this.selectedColor = color
    },

    draw(e) {
      this.ctx = this.canvas.getContext('2d');

      if (this.isDrawing) {
        if (this.selectedType == "карандаш") {
          this.savedFigures.push({ figure: 1, x: this.x, y: this.y, x2: e.offsetX, y2: e.offsetY, color: this.selectedColor, size: this.selectedOptionSize });

          this.redrawSaved();

          this.drawLine(this.x, this.y, e.offsetX, e.offsetY);

          this.x = e.offsetX;
          this.y = e.offsetY;

        } else if (this.selectedType == "прямоугольник") {
          const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
          const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.redrawSaved();

          this.drawRectangle(this.startX, this.startY, mouseX - this.startX, mouseY - this.startY);

        } else if (this.selectedType == "круг") {
          const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
          const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.redrawSaved();

          const radius = Math.sqrt(Math.pow(mouseX - this.startX, 2) + Math.pow(mouseY - this.startY, 2));
          this.drawCircle(this.startX, this.startY, radius);

        } else if (this.selectedType == "треугольник") {
          const endVertex = {
            x: e.clientX - this.canvas.getBoundingClientRect().left,
            y: e.clientY - this.canvas.getBoundingClientRect().top,
          };

          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.drawTriangle(this.startVertex, endVertex);

          this.redrawSaved(); // перерисовываем все сохраненные треугольники

        } else if (this.img !== null) {
          this.redrawSaved()

        }
      }
    },
    uploadImage(event) {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
      }

      const url = URL.createObjectURL(event.target.files[0]);
      this.img = url
      this.canvas.style.background = "url(" + url + ") no-repeat   ";

      reader.readAsDataURL(file);
    },

    drawLine(x1, y1, x2, y2, color = this.selectedColor, size = this.selectedOptionSize) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      this.ctx.lineCap = 'round';
      this.ctx.closePath();
    },

    beginDrawing(e) {
      this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
      this.startY = e.clientY - this.canvas.getBoundingClientRect().top

      this.isDrawing = true;

      if (this.selectedType == "карандаш") {
        this.x = e.offsetX;
        this.y = e.offsetY;

      } else if (this.selectedType == "треугольник") {
        this.startVertex = {
          x: e.clientX - this.canvas.getBoundingClientRect().left,
          y: e.clientY - this.canvas.getBoundingClientRect().top,
        }
      }
    },

    stopDrawing(e) {
      if (this.isDrawing) {
        this.isDrawing = false;

        this.mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
        this.mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

        if (this.selectedType == "прямоугольник") {
          const width = this.mouseX - this.startX;
          const height = this.mouseY - this.startY;

          this.savedFigures.push({ figure: 4, x: this.startX, y: this.startY, width: width, height: height, color: this.selectedColor, size: this.selectedOptionSize });

        } else if (this.selectedType == "круг") {
          const radius = Math.sqrt(Math.pow(this.mouseX - this.startX, 2) + Math.pow(this.mouseY - this.startY, 2));
          
          this.savedFigures.push({ figure: 0, x: this.startX, y: this.startY, radius: radius, color: this.selectedColor, size: this.selectedOptionSize });
        } else if (this.selectedType == "треугольник") {
          const endVertex = {
            x: e.clientX - this.canvas.getBoundingClientRect().left,
            y: e.clientY - this.canvas.getBoundingClientRect().top,
          };
          this.savedFigures.push({ figure: 3, start: this.startVertex, end: endVertex, color: this.selectedColor, size: this.selectedOptionSize });
        }
      }
    },

    drawRectangle(x, y, width, height, color = this.selectedColor, size = this.selectedOptionSize) {
      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.stroke();
      this.ctx.closePath();
    },

    drawCircle(x, y, radius, color = this.selectedColor, size = this.selectedOptionSize) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.stroke();
    },

    drawTriangle(start, end, color = this.selectedColor, size = this.selectedOptionSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.lineTo(end.x, end.y + 150);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = size;
      this.ctx.closePath()
      this.ctx.stroke();
    },

    redrawSaved() {

      for (let i = 0; i < this.savedFigures.length; i++) {
        let figure = this.savedFigures[i];
        if (figure['figure'] === 0) {
          this.drawCircle(figure.x, figure.y, figure.radius, figure.color, figure.size);
        } else if (figure['figure'] === 3) {

          this.drawTriangle(figure.start, figure.end, figure.color, figure.size);
        } else if (figure['figure'] === 4) {
          this.drawRectangle(figure.x, figure.y, figure.width, figure.height, figure.color, figure.size);

        } else if (figure['figure'] === 1) {
          this.drawLine(figure.x, figure.y, figure.x2, figure.y2, figure.color, figure.size);
        } 
      }

    },


    reset() {
      this.savedFigures = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    resetImg() {
      this.canvas.style.background = 'transparent'
    }
  }
}

</script>

<style>
canvas {
  border: 3px solid#fff;
  border-radius: 30px;
}

.menu {
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
}

.cover {
  margin-left: 200px;
  width: 920px;
  border: 1px solid #000;
  border-radius: 20px;
  background: #040811;
}

.cover__2 {
  margin: 30px;
  border: 1px solid #1B2C3C;
  border-radius: 20px;
  background: #1B2C3C;
}

.lastick {
  padding: 5px;
  width: 60px;
  height: 60px;
  background: #3D566C url(@/router/icons8-ластик-64.png) no-repeat;
  border: 1px solid #fff;
  border-radius: 10px;
  background-size: 60px;
  background-position: center center;
}

.color__palettes {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

.color__row {
  width: 80px;
  height: 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border: 1px solid#000;
}

.color__item {
  width: 23%;
  height: 23%;
  transition: all 0.3s;
}

.color__item:hover {
  width: 20%;
  height: 20%;
  border: 1px solid#fff;
}

.color__item:active {
  width: 30%;
  height: 30%;
}

.figures {
  width: 75px;
  height: 65px;
  background: #3D566C url(@/router/figures.png) no-repeat;
  border: 1px solid #fff;
  border-radius: 10px;
  background-size: 60px;
}

.brash {
  width: 75px;
  height: 65px;
  background: #3D566C url(@/router/brash.png) no-repeat;
  border: 1px solid #fff;
  border-radius: 10px;
}

.import {
  width: 60px;
  height: 60px;
  background: #3D566C url(@/router/import.png) no-repeat;
  border: 1px solid #fff;
  border-radius: 10px;
  background-position: center center;
}

.circle__1 {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #fff;
}

</style>