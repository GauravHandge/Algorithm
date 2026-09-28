/* Frontend API Service Layer */
const API_BASE = "/api";

export const API = {
  async getSubjects() {
    const res = await fetch(`${API_BASE}/subjects`);
    return await res.json();
  },

  async getTopics(subjectId = "") {
    const url = subjectId ? `${API_BASE}/topics?subject_id=${subjectId}` : `${API_BASE}/topics`;
    const res = await fetch(url);
    return await res.json();
  },

  async getAlgorithms(filters = {}) {
    const params = new URLSearchParams();
    if (filters.subject_id) params.append("subject_id", filters.subject_id);
    if (filters.topic_id) params.append("topic_id", filters.topic_id);
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`${API_BASE}/algorithms?${params.toString()}`);
    return await res.json();
  },

  async getAlgorithmDetail(algorithmId) {
    const res = await fetch(`${API_BASE}/algorithms/${algorithmId}`);
    return await res.json();
  },

  async executeAlgorithm(algorithmId, inputData = {}) {
    const res = await fetch(`${API_BASE}/algorithms/${algorithmId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_data: inputData })
    });
    return await res.json();
  },

  async explainStep(algorithmId, stepState) {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ algorithm_id: algorithmId, step_state: stepState })
    });
    return await res.json();
  },

  async getHint(algorithmId, stepState) {
    const res = await fetch(`${API_BASE}/ai/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ algorithm_id: algorithmId, step_state: stepState })
    });
    return await res.json();
  },

  async askAIChat(algorithmId, message, stepState) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ algorithm_id: algorithmId, message: message, step_state: stepState })
    });
    return await res.json();
  },

  async getQuestions(subjectId = "", algorithmId = "") {
    let url = `${API_BASE}/questions?`;
    if (algorithmId) url += `algorithm_id=${algorithmId}&`;
    if (subjectId) url += `subject_id=${subjectId}&`;
    const res = await fetch(url);
    return await res.json();
  },

  async submitQuiz(subjectId, answers) {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject_id: subjectId, answers: answers })
    });
    return await res.json();
  },

  async getProgress() {
    const res = await fetch(`${API_BASE}/progress`);
    return await res.json();
  }
};
