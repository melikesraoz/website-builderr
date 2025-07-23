namespace HotelBuilder.Domain.Entities
{
    public class GalleryImage
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string? Caption { get; set; }  

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;
    }
}
