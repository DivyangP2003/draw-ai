// Math expression parser and calculator using math.js
export async function calculateExpression(expression, variables = {}) {
  try {
    // Replace variables in expression
    let processedExpr = expression
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, "g")
      processedExpr = processedExpr.replace(regex, `(${value})`)
    })

    // Dynamic import of math.js
    const math = await import("mathjs")
    const result = math.evaluate(processedExpr)

    return {
      success: true,
      result: typeof result === "number" ? Number.parseFloat(result.toFixed(10)) : result,
      expression: expression,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      expression: expression,
    }
  }
}

// Parse and extract variables from expression
export function extractVariables(expression) {
  const varRegex = /([a-zA-Z_]\w*)\s*=/g
  const variables = {}
  let match

  while ((match = varRegex.exec(expression)) !== null) {
    variables[match[1]] = null
  }

  return variables
}

// Generate graph data for plotting
export async function generateGraphData(expression, variables = {}, xMin = -10, xMax = 10, step = 0.5) {
  const data = []

  try {
    const math = await import("mathjs")

    for (let x = xMin; x <= xMax; x += step) {
      let expr = expression.replace(/x/g, `(${x})`)

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, "g")
        expr = expr.replace(regex, `(${value})`)
      })

      try {
        const y = math.evaluate(expr)
        if (typeof y === "number" && isFinite(y)) {
          data.push({ x: Number.parseFloat(x.toFixed(2)), y: Number.parseFloat(y.toFixed(2)) })
        }
      } catch (e) {
        // Skip invalid points
      }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Derivative approximation using numerical differentiation
export async function calculateDerivative(expression, variable = "x", atPoint = 0) {
  const h = 0.0001

  try {
    const math = await import("mathjs")

    const f1 = math.evaluate(expression.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${atPoint + h})`))
    const f2 = math.evaluate(expression.replace(new RegExp(`\\b${variable}\\b`, "g"), `(${atPoint - h})`))

    const derivative = (f1 - f2) / (2 * h)

    return {
      success: true,
      derivative: Number.parseFloat(derivative.toFixed(6)),
      atPoint,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Unit conversion
export const unitConversions = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.34,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254,
  },
  temperature: {
    C: (v, to) => {
      if (to === "F") return (v * 9) / 5 + 32
      if (to === "K") return v + 273.15
      return v
    },
    F: (v, to) => {
      if (to === "C") return ((v - 32) * 5) / 9
      if (to === "K") return ((v - 32) * 5) / 9 + 273.15
      return v
    },
    K: (v, to) => {
      if (to === "C") return v - 273.15
      if (to === "F") return ((v - 273.15) * 9) / 5 + 32
      return v
    },
  },
  weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495,
  },
}

export function convertUnits(value, fromUnit, toUnit, type = "length") {
  try {
    if (type === "temperature") {
      const converter = unitConversions.temperature[fromUnit]
      if (!converter) throw new Error(`Unknown temperature unit: ${fromUnit}`)
      return converter(value, toUnit)
    }

    const conversions = unitConversions[type]
    if (!conversions) throw new Error(`Unknown conversion type: ${type}`)

    const fromFactor = conversions[fromUnit]
    const toFactor = conversions[toUnit]

    if (!fromFactor || !toFactor) {
      throw new Error(`Unknown unit: ${!fromFactor ? fromUnit : toUnit}`)
    }

    return (value * fromFactor) / toFactor
  } catch (error) {
    return { error: error.message }
  }
}

// Matrix operations
export async function matrixMultiply(matrixA, matrixB) {
  try {
    const math = await import("mathjs")
    const result = math.multiply(matrixA, matrixB)
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function matrixDeterminant(matrix) {
  try {
    const math = await import("mathjs")
    const result = math.det(matrix)
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function matrixInverse(matrix) {
  try {
    const math = await import("mathjs")
    const result = math.inv(matrix)
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
