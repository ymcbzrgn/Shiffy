import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  placeholderText?: string;
}

const ImageCarousel = ({ images, alt, placeholderText }: ImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "center"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 gradient-primary opacity-20 blur-2xl group-hover:opacity-30 transition-smooth" />
        <div className="relative w-full mx-auto max-w-3xl bg-card rounded-3xl border-8 border-foreground/10 shadow-2xl overflow-hidden" style={{ minHeight: '350px', maxHeight: '500px' }}>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <p className="text-center text-muted-foreground font-medium px-8">
              {placeholderText || "Screenshots"}
              <br />
              <span className="text-sm">(Coming Soon)</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      {/* Glow effect */}
      <div className="absolute inset-0 gradient-primary opacity-20 blur-2xl group-hover:opacity-30 transition-smooth" />
      
      {/* Carousel container */}
      <div className="relative w-full mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border-8 border-foreground/10 shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="relative w-full flex items-center justify-center" style={{ minHeight: '350px', maxHeight: '500px' }}>
                  <img
                    src={image}
                    alt={`${alt} - Screenshot ${index + 1}`}
                    className="w-full h-auto max-h-[500px] object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
                            Image ${index + 1}<br/>Not Found
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-smooth z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-smooth z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === selectedIndex
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
