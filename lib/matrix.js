/**
 * Matrix library based on - https://github.com/CodingTrain/Toy-Neural-Network-JS/blob/master/lib/matrix.js
 */
class Matrix {
  /**
   * Values are initialized to 0
   * @param {number} Rows
   * @param {number} Columns
   */
  constructor(rows,cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];

    for(let i = 0 ; i < this.rows ; i++) {
      this.data[i] = [];
      for (let j=0; j < this.cols ; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  multiply(n) {
    if(n instanceof Matrix) { //hadamard multiplication (corresponding element multiplies to this matrix)
      if(n.rows == this.rows && n.cols == this.cols) {
        for(let i=0; i < this.rows ; i++) {
          for(let j=0; j < this.cols ; j++) {
            this.data[i][j] *= n.data[i][j];
          }
        }
      }
      else {
        console.error("element wise multiplication failed because of size mismatch!");
        return -1; //failed bcoz of size mismatch
      }
    }
    else { //scalar multiply
      for (let i = 0; i < this.rows; i++) {
        for(let j=0; j <this.cols; j++) {
          this.data[i][j] *= n;
        }
      }
    }
  }

  static multiply(matx1, matx2) { //returns new matrix ARGS (matrix,matrix) or (matrix,scalar)

    if(matx1.cols == matx2.rows && matx1 instanceof Matrix && matx2 instanceof Matrix) { //actual matrix multiplication
      let nrows = matx1.rows; //new rows
      let ncols = matx2.cols; //new cols
      // let newmat = [];
      let newmat = new Matrix(matx1.rows,matx2.cols);
      for(let i = 0 ; i < nrows ; i++) {
        for (let j=0; j < ncols ; j++) {
          newmat.data[i][j] = 0;
          for(let k=0; k < matx1.cols ; k++) {
            newmat.data[i][j] += matx1.data[i][k]*matx2.data[k][j];
          }
        }
      }
      return newmat;
    }
    else {
      if(matx1 instanceof Matrix && !(matx2 instanceof Matrix)) { //scalar multiply
        let n = matx2; //scalar value

        //copying matx1 w/o reference
        let imat = new Matrix(matx1.rows,matx1.cols);
        for(let i=0;i<matx1.rows;i++)
          for(let j=0;j<matx1.cols;j++)
            imat.data[i][j] = matx1.data[i][j];
        //copying - END

        for (let i = 0; i < matx1.rows; i++) {
          for(let j=0; j <matx1.cols; j++) {
            imat.data[i][j] *= n;
          }
        }
        return imat;
      }
      else {
        if(!(matx1.cols == matx2.rows))
          console.error('size mismatch!');
        if(!(matx1 instanceof Matrix && matx2 instanceof Matrix))
          console.error('argument to matrix multiplication func should be only Matrix objects');
        console.error("Matrix multiplication failed!");
        return -1; //product not possible
      }
    }
  }

  copy() {
    let newmat = new Matrix(this.rows,this.cols);
    for(let i=0;i<this.rows;i++)
      for(let j=0;j<this.cols;j++)
        newmat.data[i][j] = this.data[i][j];

    return newmat;
  }

  print() {
    console.table(this.data);
  }

  static transpose(imat) { //returns transposed matrix
    let transposed = new Matrix(imat.cols,imat.rows);

    for(let i=0;i<imat.cols;i++) {
      for(let j=0;j<imat.rows;j++) {
        transposed.data[i][j] = imat.data[j][i];
      }
    }

    return transposed;
  }

  add(newdata) {
    if(newdata instanceof Matrix) { //add element wise
      for(let i=0;i<this.rows;i++)
        for(let j=0;j<this.cols;j++)
          this.data[i][j] += newdata.data[i][j];
    }
    else { //add newdata to each element
      for(let i=0;i<this.rows;i++)
        for(let j=0;j<this.cols;j++)
          this.data[i][j] += newdata;
    }
  }

  static add(m1,m2) { //adds n to each element of this matrix or adds 2 matrix (of same dimension) element wise
    if(m1 instanceof Matrix && m2 instanceof Matrix && m1.rows == m2.rows && m1.cols == m2.cols) {
      let newmat = new Matrix(m1.rows,m1.cols);

      for (let i = 0; i < m1.rows; i++) {
        for(let j=0; j <m1.cols; j++) {
          newmat.data[i][j] = m1.data[i][j] + m2.data[i][j];
        }
      }

      return newmat;
    }
    else {
      if(!(m1.rows == m2.rows && m1.cols == m2.cols)) {
        console.log('tried to add..')
        m1.print();
        console.log('this one ...')
        m2.print();
        console.error('invaild addition : size mismatch');
        return -1;
      }
      console.error('invaild addition');
      return -1;
    }
  }

  map(func) { //maps this matrix obj
    for(let i=0;i<this.rows;i++) {
      for(let j=0;j<this.cols;j++) {
        let val = this.data[i][j];
        this.data[i][j] = func(val);
      }
    }
  }

  //returns mapped matrix obj
  static map(matrix, func) {
    let newmat = new Matrix(matrix.rows,matrix.cols);

    for(let i=0;i<matrix.rows;i++) {
      for(let j=0;j<matrix.cols;j++) {
        newmat.data[i][j] = func(matrix.data[i][j]);
      }
    }

    return newmat;
  }

  //randomizes this matrix
  randomize() {
    for (let i = 0; i < this.rows; i++) {
      for(let j=0; j <this.cols; j++) {
        this.data[i][j] = (Math.random()*2) - 1 ; //random number between -1 and 1
      }
    }
  }

  /**
   * takes array of numbers and returns a 1d Matrix object
   * @param {array} arr - array of numbers
   */
  static fromArray(arr) {
    let rows = arr.length;
    let cols = 1;

    let matrix = new Matrix(rows,cols);
    for(let i=0; i<rows ;i++)
      matrix.data[i][0] = arr[i];

    return matrix;
  }

  //gives 1d array (need to update for any dimension of matrix)
  toArray() {
    let arr = [];
    for(let i=0;i<this.rows;i++)
      for(let j=0;j<this.cols;j++)
        arr.push(this.data[i][j]);
    return arr;
  }
}