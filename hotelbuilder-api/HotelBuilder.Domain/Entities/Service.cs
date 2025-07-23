namespace HotelBuilder.Domain.Entities
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;    
        public string IconUrl { get; set; } = null!;  

        
        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = null!;
    }
}
