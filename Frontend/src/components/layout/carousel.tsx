import { useState } from "react";
import styles from "./carousel.module.css";
import baconcheep from "../../assets/images/baconcheep.jpg";
import barbacue from "../../assets/images/cheddar.jpg";
import cheddar from "../../assets/images/barbacue.jpg";

const images = [baconcheep, barbacue, cheddar];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className={styles["carousel-container"]}>
      <img
        src={images[currentIndex]}
        alt={`slide-${currentIndex}`}
        className={`${styles["carousel-image"]} ${
          images[currentIndex] === baconcheep ? styles["baconcheep"] : ""
        }`}
      />
      <button
        onClick={goToPrevious}
        className={`${styles["carousel-button"]} ${styles.left}`}
      >
        ❮
      </button>
      <button
        onClick={goToNext}
        className={`${styles["carousel-button"]} ${styles.right}`}
      >
        ❯
      </button>
    </div>
  );
};

export default Carousel;
