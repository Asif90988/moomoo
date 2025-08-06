// Neural Core Alpha-7 - Matrix Operations for IPCA
// Pure JavaScript matrix operations for better Next.js compatibility

export class MatrixOps {
  /**
   * Create a matrix filled with zeros
   */
  static zeros(rows: number, cols: number): number[][] {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
  }

  /**
   * Create a matrix filled with random values
   */
  static random(rows: number, cols: number, scale: number = 1): number[][] {
    return Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2 * scale)
    );
  }

  /**
   * Create an identity matrix
   */
  static identity(size: number): number[][] {
    const result = this.zeros(size, size);
    for (let i = 0; i < size; i++) {
      result[i][i] = 1;
    }
    return result;
  }

  /**
   * Matrix multiplication
   */
  static multiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    
    if (colsA !== B.length) {
      throw new Error(`Matrix dimensions don't match: ${rowsA}x${colsA} * ${B.length}x${colsB}`);
    }

    const result = this.zeros(rowsA, colsB);
    
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    
    return result;
  }

  /**
   * Matrix transpose
   */
  static transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result = this.zeros(cols, rows);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = A[i][j];
      }
    }
    
    return result;
  }

  /**
   * Matrix addition
   */
  static add(A: number[][], B: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result = this.zeros(rows, cols);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[i][j] = A[i][j] + B[i][j];
      }
    }
    
    return result;
  }

  /**
   * Matrix subtraction
   */
  static subtract(A: number[][], B: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result = this.zeros(rows, cols);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[i][j] = A[i][j] - B[i][j];
      }
    }
    
    return result;
  }

  /**
   * Scalar multiplication
   */
  static scale(A: number[][], scalar: number): number[][] {
    return A.map(row => row.map(val => val * scalar));
  }

  /**
   * Solve linear system Ax = b using Gaussian elimination
   */
  static solve(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
    
    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }
    
    return x;
  }

  /**
   * Compute matrix inverse using Gauss-Jordan elimination
   */
  static inverse(A: number[][]): number[][] {
    const n = A.length;
    const augmented = A.map((row, i) => {
      const identity = this.identity(n);
      return [...row, ...identity[i]];
    });
    
    // Gauss-Jordan elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make diagonal element 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      // Make other elements in column 0
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    // Extract inverse matrix
    return augmented.map(row => row.slice(n));
  }

  /**
   * Compute SVD approximation for low-rank approximation
   */
  static svdApprox(A: number[][], rank: number): { U: number[][], S: number[], V: number[][] } {
    // Simplified SVD using power iteration
    const m = A.length;
    const n = A[0].length;
    const AT = this.transpose(A);
    const ATA = this.multiply(AT, A);
    
    const U: number[][] = [];
    const S: number[] = [];
    const V: number[][] = [];
    
    for (let k = 0; k < Math.min(rank, Math.min(m, n)); k++) {
      // Power iteration to find dominant eigenvector
      let v = Array(n).fill(0).map(() => Math.random());
      
      for (let iter = 0; iter < 20; iter++) {
        // Multiply by A^T A
        const newV = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newV[i] += ATA[i][j] * v[j];
          }
        }
        
        // Normalize
        const norm = Math.sqrt(newV.reduce((sum, x) => sum + x * x, 0));
        v = newV.map(x => x / norm);
      }
      
      // Compute corresponding u and sigma
      const Av = new Array(m).fill(0);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          Av[i] += A[i][j] * v[j];
        }
      }
      
      const sigma = Math.sqrt(Av.reduce((sum, x) => sum + x * x, 0));
      const u = Av.map(x => x / sigma);
      
      U.push(u);
      S.push(sigma);
      V.push(v);
      
      // Deflate A for next iteration
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          A[i][j] -= sigma * u[i] * v[j];
        }
      }
    }
    
    return { U: this.transpose(U), S, V: this.transpose(V) };
  }

  /**
   * Compute Frobenius norm
   */
  static frobeniusNorm(A: number[][]): number {
    let sum = 0;
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        sum += A[i][j] * A[i][j];
      }
    }
    return Math.sqrt(sum);
  }

  /**
   * Check if matrix is valid (no NaN or Infinity)
   */
  static isValid(A: number[][]): boolean {
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        if (!isFinite(A[i][j])) {
          return false;
        }
      }
    }
    return true;
  }
}