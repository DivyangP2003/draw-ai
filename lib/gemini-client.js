// Google Gemini API client for AI-powered explanations and problem solving

export async function explainConcept(concept) {
  try {
    const response = await fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept }),
    })

    if (!response.ok) throw new Error("Failed to get explanation")
    return await response.json()
  } catch (error) {
    return { error: error.message }
  }
}

export async function solveProblem(problemDescription) {
  try {
    const response = await fetch("/api/gemini/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: problemDescription }),
    })

    if (!response.ok) throw new Error("Failed to solve problem")
    return await response.json()
  } catch (error) {
    return { error: error.message }
  }
}

export async function solveFromImage(imageBase64) {
  try {
    const response = await fetch("/api/gemini/solve-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    })

    if (!response.ok) throw new Error("Failed to solve from image")
    return await response.json()
  } catch (error) {
    return { error: error.message }
  }
}

export async function getStepByStepSolution(equation) {
  try {
    const response = await fetch("/api/gemini/step-by-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equation }),
    })

    if (!response.ok) throw new Error("Failed to get step-by-step solution")
    return await response.json()
  } catch (error) {
    return { error: error.message }
  }
}
