export interface ReviewLike {
  rating: number;
}

export interface CafeteriaRatingData {
  adminRating: number;
  displayRating: number;
}

export function getAverageRating(reviews: ReviewLike[]) {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((acc, review) => acc + review.rating, 0);

  return total / reviews.length;
}

export function getDisplayRating(adminRating: number, reviews: ReviewLike[]) {
  const userAverage = getAverageRating(reviews);

  if (!userAverage) {
    return adminRating;
  }

  return (adminRating + userAverage) / 2;
}
