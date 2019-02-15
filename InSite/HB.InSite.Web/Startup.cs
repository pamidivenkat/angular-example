using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HB.InSite.Web
{
    public class Startup
    {
        private readonly IConfiguration config;
        private readonly IHostingEnvironment env;

        public Startup(IConfiguration config, IHostingEnvironment env)
        {
            this.config = config;
            this.env = env;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // enable https/ssl for production for the entire site
            services.AddMvc(opt => 
            {
                //if (env.IsProduction() && config["DisableSSL"] != "true")
                //{
                //    opt.Filters.Add(new RequireHttpsAttribute());
                //}
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
            }

            app.UseStaticFiles();

            app.UseMvc(cfg => {
                cfg.MapRoute(
                    name: "Default",
                    template: "{controller}/{action}/{id?}",
                    defaults: new { Controller = "App", Action = "Index" });

                cfg.MapSpaFallbackRoute("spa-fallback", new { controller = "App", action = "Index" });
            });
        }
    }
}
