using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeHub.Hub.Migrations
{
    /// <inheritdoc />
    public partial class AddConcurrencyVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Tasks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "RecurringTasks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Notes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Lists",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Events",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Version",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "RecurringTasks");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Lists");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Events");
        }
    }
}
