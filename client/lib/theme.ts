export const roleTheme = {
  student: {
    gradient: "from-indigo-600 to-sky-500",
    solid: "bg-indigo-600",
  },
  parent: {
    gradient: "from-fuchsia-600 to-pink-500",
    solid: "bg-fuchsia-600",
  },
  mentor: {
    gradient: "from-emerald-600 to-teal-500",
    solid: "bg-emerald-600",
  },
} as const;

export const iconSize = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
} as const;
