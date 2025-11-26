export interface AvatarColorSwatch {
  name: string;
  hex: string;
}

export interface PhotoScore {
  label: string;
  value: number;
}

export interface UserAvatarRecord {
  usuarioId: number;
  imagenAvatar: string | null;
  calidadFoto: PhotoScore[];
  createDate: string | null;
  temporadaPalette: string | null;
  tonoPiel: string | null;
  subtono: string | null;
  coloresRecomendados: AvatarColorSwatch[];
  coloresEvitar: AvatarColorSwatch[];
}
