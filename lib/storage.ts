import { EditorState, ProjectData } from './types';

const STORAGE_KEY = 'pixel-grid-projects';

export function saveProject(name: string, state: EditorState): void {
  const projects = getProjectList();
  const project: ProjectData = {
    name,
    gridSettings: state.gridSettings,
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    savedAt: new Date().toISOString(),
  };

  const index = projects.findIndex(p => p.name === name);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProject(name: string): ProjectData | null {
  const projects = getProjectList();
  return projects.find(p => p.name === name) ?? null;
}

export function getProjectList(): ProjectData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteProject(name: string): void {
  const projects = getProjectList().filter(p => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function exportProjectJson(state: EditorState): string {
  const project: ProjectData = {
    name: 'export',
    gridSettings: state.gridSettings,
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    savedAt: new Date().toISOString(),
  };
  return JSON.stringify(project, null, 2);
}

function isValidProject(data: unknown): data is ProjectData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    obj.gridSettings != null && typeof obj.gridSettings === 'object' &&
    Array.isArray(obj.layers) && obj.layers.length > 0 &&
    typeof obj.activeLayerId === 'string'
  );
}

export function importProjectJson(json: string): ProjectData | null {
  try {
    const parsed = JSON.parse(json);
    if (isValidProject(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
