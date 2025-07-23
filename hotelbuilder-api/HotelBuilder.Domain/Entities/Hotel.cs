using System.Collections.Generic;

namespace HotelBuilder.Domain.Entities
{
    public class Hotel
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string LogoUrl { get; set; } = null!;
        public int StarRating { get; set; }

        public ICollection<Room>? Rooms { get; set; }
        public ICollection<Service>? Services { get; set; }
        public ICollection<GalleryImage>? GalleryImages { get; set; }

    }

}