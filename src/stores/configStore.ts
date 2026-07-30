/**
 * 配置 Store — 管理应用设置和用户偏好
 */

import { create } from 'zustand';
import type { ModelOption, Profile, Skill } from '../types';
import type { ColorScheme } from '../theme/colors';

interface ConfigStore {
  /** 主题配色 (亮/暗/跟随系统) */
  colorScheme: ColorScheme;
  /** 是否跟随系统主题 */
  useSystemTheme: boolean;
  /** 当前选中的模型 */
  selectedModel: ModelOption | null;
  /** 模型选项列表 */
  modelOptions: ModelOption[];
  /** Profile 列表 */
  profiles: Profile[];
  /** 当前 Profile */
  activeProfile: Profile | null;
  /** 技能列表 */
  skills: Skill[];

  setColorScheme: (scheme: ColorScheme) => void;
  setUseSystemTheme: (use: boolean) => void;
  setSelectedModel: (model: ModelOption | null) => void;
  setModelOptions: (options: ModelOption[]) => void;
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (profile: Profile | null) => void;
  setSkills: (skills: Skill[]) => void;
  toggleSkill: (name: string) => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  colorScheme: 'light',
  useSystemTheme: true,
  selectedModel: null,
  modelOptions: [],
  profiles: [],
  activeProfile: null,
  skills: [],

  setColorScheme: (colorScheme) => set({ colorScheme }),
  setUseSystemTheme: (useSystemTheme) => set({ useSystemTheme }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setModelOptions: (modelOptions) => set({ modelOptions }),
  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (activeProfile) => set({ activeProfile }),
  setSkills: (skills) => set({ skills }),

  toggleSkill: (name) =>
    set((state) => ({
      skills: state.skills.map((s) =>
        s.name === name ? { ...s, enabled: !s.enabled } : s,
      ),
    })),
}));
