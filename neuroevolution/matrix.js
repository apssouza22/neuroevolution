/**
 * This class provides some basic matrix operations
 */
class Matrix {

    /**
     * Values are initialized to 0
     * @param {number} Rows
     * @param {number} Columns
     */
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = 0;
            }
        }
    }

    /**
     * Applies matrix multiplication to each element of the matrix(Dot product)
     *
     * @param {Matrix | number} n
     * @returns {Matrix}
     */
    multiply(n) {
        let newMatrix = Matrix.multiply(this, n);
        this.data = newMatrix.data;
        this.cols = newMatrix.cols;
        this.rows = newMatrix.rows;
        return this;
    }

    /**
     * Applies matrix multiplication to each element of the matrix
     * (matrix,matrix) or (matrix,scalar)
     * @param {Matrix} matrix1
     * @param {Matrix | number} matrix2
     * @returns {Matrix}
     */
    static multiply(matrix1, matrix2) {
        //scalar multiply
        if (matrix1 instanceof Matrix && !(matrix2 instanceof Matrix)) {
            let num = matrix2; //scalar value
            let newMatrix = Matrix.copy(matrix1);
            for (let i = 0; i < matrix1.rows; i++) {
                for (let j = 0; j < matrix1.cols; j++) {
                    newMatrix.data[i][j] *= num;
                }
            }
            return newMatrix;
        }
        if (!(matrix1 instanceof Matrix && matrix2 instanceof Matrix)) {
            throw new Error('Multiplication failed because no Matrix object found!');
        }

        if (matrix2.rows == matrix1.rows && matrix2.cols == matrix1.cols) {
            for (let i = 0; i < matrix1.rows; i++) {
                for (let j = 0; j < matrix1.cols; j++) {
                    matrix1.data[i][j] *= matrix2.data[i][j];
                }
            }
            return matrix1;
        }

        return this.calcMatrixProduct(matrix1, matrix2);
    }

    /**
     ** Matrix multiplication - cols * rows
     ** For matrix multiplication, the number of columns in the first matrix must be equal to the number of rows in the second matrix.
     ** The resulting matrix, known as the matrix product, has the number of rows of the first and the number of columns of the second matrix
     * @param {Matrix} matrix1
     * @param {Matrix} matrix2
     * @returns {Matrix}
     **/
    static calcMatrixProduct(matrix1, matrix2) {
        if (matrix1.cols != matrix2.rows) {
            throw new Error('multiplication failed because of size mismatch!');
        }

        let newMatrix = new Matrix(matrix1.rows, matrix2.cols);
        for (let i = 0; i < newMatrix.rows; i++) {
            for (let j = 0; j < newMatrix.cols; j++) {
                newMatrix.data[i][j] = 0;
                for (let k = 0; k < matrix1.cols; k++) {
                    newMatrix.data[i][j] += matrix1.data[i][k] * matrix2.data[k][j];
                }
            }
        }
        return newMatrix;
    }

    /**
     * Creates a copy of a matrix
     * @param {Matrix} matrix
     * @returns {Matrix}
     */
    static copy(matrix) {
        let newMat = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                newMat.data[i][j] = matrix.data[i][j];
            }
        }
        return newMat;
    }

    /**
     * Prints the matrix
     */
    print() {
        console.table(this.data);
    }

    /**
     * Transposes the matrix
     * @param matrix
     * @returns {Matrix}
     */
    static transpose(matrix) {
        let transposed = new Matrix(matrix.cols, matrix.rows);

        for (let i = 0; i < matrix.cols; i++) {
            for (let j = 0; j < matrix.rows; j++) {
                transposed.data[i][j] = matrix.data[j][i];
            }
        }

        return transposed;
    }

    /**
     * Applies addition to each element of the matrix
     * @param {Matrix| number}matrix
     */
    add(matrix) {
        let newMatrix = Matrix.add(this, matrix);
        this.data = newMatrix.data;
        this.cols = newMatrix.cols;
        this.rows = newMatrix.rows;
        return this;
    }

    /**
     * Applies addition to each element of the matrix
     * @param {Matrix} m1
     * @param {Matrix|number} m2
     * @returns {Matrix}
     */
    static add(m1, m2) {
        if (m1 instanceof Matrix && m2 instanceof Matrix) {
            if (m1.rows != m2.rows || m1.cols != m2.cols) {
                throw new Error('invalid addition : size mismatch');
            }
            let newMatrix = new Matrix(m1.rows, m1.cols);
            for (let i = 0; i < m1.rows; i++) {
                for (let j = 0; j < m1.cols; j++) {
                    newMatrix.data[i][j] = m1.data[i][j] + m2.data[i][j];
                }
            }
            return newMatrix;
        }
        //scalar addition
        for (let i = 0; i < m1.rows; i++) {
            for (let j = 0; j < m1.cols; j++) {
                m1.data[i][j] += m2;
            }
        }
        return m1;
    }

    /**
     * Applies a function to each element of the matrix
     * @param {(number)=>{}}func
     */
    map(func) {
        let newMatrix = Matrix.map(this, func);
        this.data = newMatrix.data;
        this.cols = newMatrix.cols;
        this.rows = newMatrix.rows;
        return this;
    }

    /**
     * Applies a function to each element of the matrix
     * @param {Matrix} matrix
     * @param {(number)=>{}}func
     */
    static map(matrix, func) {
        let newMatrix = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                newMatrix.data[i][j] = func(matrix.data[i][j]);
            }
        }
        return newMatrix;
    }

    /**
     * Create a randomized matrix
     * @param {number} rows
     * @param {number} cols
     * @returns {Matrix}
     */
    static randomize(rows, cols) {
        let newMatrix = new Matrix(rows, cols)
        for (let i = 0; i < newMatrix.rows; i++) {
            for (let j = 0; j < newMatrix.cols; j++) {
                newMatrix.data[i][j] = (Math.random() * 2) - 1; //random number between -1 and 1
            }
        }
        return newMatrix;
    }


    /**
     * Takes array of numbers and returns a 1d Matrix object
     * @param {number[]} arr - array of numbers
     */
    static fromArray(arr) {
        let rows = arr.length;
        let cols = 1;

        let matrix = new Matrix(rows, cols);
        for (let i = 0; i < rows; i++) {
            matrix.data[i][0] = arr[i];
        }

        return matrix;
    }

    /**
     * Return a 1d array of the matrix
     * @return {number[]}
     */
    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }
}