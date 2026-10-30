using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeHub.Hub.Migrations
{
    /// <inheritdoc />
    public partial class AddUsersAndUserIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Start is now required; give legacy rows without one a usable timestamp
            // instead of letting the NOT NULL rebuild fail.
            migrationBuilder.Sql(
                "UPDATE \"Events\" SET \"Start\" = COALESCE(\"End\", datetime('now')) WHERE \"Start\" IS NULL;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Start",
                table: "Events",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    HashedApiKey = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_HashedApiKey",
                table: "Users",
                column: "HashedApiKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Start",
                table: "Events",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT");
        }
    }
}
