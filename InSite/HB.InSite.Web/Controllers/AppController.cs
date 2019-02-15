using Microsoft.AspNetCore.Mvc;

namespace HB.InSite.Web.Controllers
{
    public class AppController : Controller
    {
        public IActionResult Index()
        {
            ViewBag.requestedWith = Request.Headers["X-Requested-With"];
            ViewBag.requestHeaders = Request.Headers;
            return View();
        }

        public IActionResult Contact()
        {
            return View();
        }

        public IActionResult About()
        {
            return View();
        }
    }
}
