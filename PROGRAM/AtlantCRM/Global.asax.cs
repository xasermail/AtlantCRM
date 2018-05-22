using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using AtlantCRM.Models;
using AutoMapper;
using Newtonsoft.Json;

namespace AtlantCRM
{

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            JsonConvert.DefaultSettings = () => new JsonSerializerSettings {
              Formatting = Newtonsoft.Json.Formatting.Indented,
              ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore,
              //DateFormatString = "yyyy-MM-dd",
              //DateTimeZoneHandling = DateTimeZoneHandling.Utc
            };

            Mapper.Initialize(cfg => {
              cfg.CreateMap<O_ANK, O_ANKViewModel>();
              cfg.CreateMap<O_DILER_A_SKLAD, O_DILER_A_SKLADViewModel>();
              cfg.CreateMap<O_DILER_A_PRICE, O_DILER_A_PRICEViewModel>();
              cfg.CreateMap<O_DILER_C_SKLAD, O_DILER_C_SKLADViewModel>();
              cfg.SourceMemberNamingConvention = new LowerUnderscoreNamingConvention();
              cfg.DestinationMemberNamingConvention = new LowerUnderscoreNamingConvention();
            });

        }

        protected void Application_BeginRequest() {
          //NOTE: Stopping IE from being a caching 
          HttpContext.Current.Response.Cache.SetAllowResponseInBrowserHistory(false);
          HttpContext.Current.Response.Cache.SetCacheability(HttpCacheability.NoCache);
          HttpContext.Current.Response.Cache.SetNoStore();
          Response.Cache.SetExpires(DateTime.Now);
          Response.Cache.SetValidUntilExpires(true);
        }

  }
}
