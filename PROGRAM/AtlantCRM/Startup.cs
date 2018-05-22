using System.Configuration;
using Hangfire;
using Hangfire.Dashboard;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(AtlantCRM.Startup))]
namespace AtlantCRM
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            // если надо запустить планировщик Hangfire
            if (ConfigurationManager.AppSettings.Get("doJobs") == "1") {
              GlobalConfiguration.Configuration.UseSqlServerStorage("DefaultConnection");
              // допуск к консоли hangfire только под admin
              app.UseHangfireDashboard("/hangfire", new DashboardOptions() {
                Authorization = new [] {new MyAuthorizationFilter()}
              });
              app.UseHangfireServer();
              GlobalJobFilters.Filters.Add(new AutomaticRetryAttribute { Attempts = 3 });

              RecurringJob.AddOrUpdate(() =>  AtlantCRM.Controllers.HomeController.Job1(), Cron.MinuteInterval(30));
            }

        }
    }




    // фильтр авторизации пользователя при доступе к консоли управления hangfire
    public class MyAuthorizationFilter: IDashboardAuthorizationFilter {

      public bool Authorize(DashboardContext context) {

        // получаем структуру, в которой в том числе хранятся данные об авторизации текущего пользователя
        OwinContext owinContext = new OwinContext(context.GetOwinEnvironment());
        // если пользователь аутентифицирован (вошёл в систему)
        if (owinContext.Authentication.User.Identity.IsAuthenticated) {
          // и вошёл под логином admin
          if (owinContext.Authentication.User.Identity.Name.ToUpper() == "admin".ToUpper()) {
            // то допускаю его до консоли управления hangfire
            return true;

          // во всех остальных случаях доступ запрещён 
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }


}
