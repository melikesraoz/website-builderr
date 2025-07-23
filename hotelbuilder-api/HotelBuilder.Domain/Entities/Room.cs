namespace HotelBuilder.Domain.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = null!;

        // Otel ilişkisi
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;
    }
}
