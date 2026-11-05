using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeHub.Hub.Migrations
{
    /// <inheritdoc />
    public partial class AddPrioritizedList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Prioritized",
                table: "Lists",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Prioritized",
                table: "Lists");
        }
    }
}
