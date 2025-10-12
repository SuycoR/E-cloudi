export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemName?: string; // "productos", "usuarios", etc.
}

export interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemName?: string;
}