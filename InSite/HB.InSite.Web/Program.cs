using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HB.InSite.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(SetupConfiguration)  // added to setup the configuration explicitly
                .UseStartup<Startup>()
                .Build();

        private static void SetupConfiguration(WebHostBuilderContext context, IConfigurationBuilder builder)
        {
            // remove the default configuration options
            builder.Sources.Clear();

            // supports multiple sources
            builder.AddJsonFile("config.json", false, true)
                .AddEnvironmentVariables();
        }
    }
}
