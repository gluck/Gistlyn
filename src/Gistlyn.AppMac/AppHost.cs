using System;
using System.Net;
using System.Reflection;
using System.Linq;
using Funq;
using ServiceStack;
using ServiceStack.Text;
using ServiceStack.Auth;
using ServiceStack.Redis;
using AppKit;
using Gistlyn.ServiceInterface;
using Gistlyn.Resources;

namespace Gistlyn.AppMac
{
	public class AppHost : AppSelfHostBase
	{
		/// <summary>
		/// Default constructor.
		/// Base constructor requires a name and assembly to locate web service classes. 
		/// </summary>
		public AppHost()
			: base("Gistlyn.AppMac", typeof(MyServices).Assembly) {}

		/// <summary>
		/// Application specific configuration
		/// This method should initialize any IoC resources utilized by your web service classes.
		/// </summary>
		/// <param name="container"></param>
		public override void Configure(Container container)
		{
			//Config examples
			//this.Plugins.Add(new PostmanFeature());
			//Plugins.Add(new CorsFeature());

			SetConfig(new HostConfig {
				DebugMode = true,
				EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(SharedEmbeddedResources) }
			});

			SharedAppHostConfig.Configure(this, "~/packages".MapAbsolutePath());

			Routes.Add<NativeHostAction>("/nativehost/{Action}");
			ServiceController.RegisterService(typeof(NativeHostService));
		}
	}

	public class NativeHostService : Service
	{
		public void Any(NativeHostAction request)
		{
			if (string.IsNullOrEmpty(request.Action)) 
				throw HttpError.NotFound ("Function Not Found");

			var nativeHost = typeof(NativeHost).CreateInstance<NativeHost>();
			var methodName = request.Action.Substring(0, 1).ToUpper() + request.Action.Substring(1);
			var methodInfo = typeof(NativeHost).GetMethod(methodName);
			if (methodInfo == null)
				throw new HttpError(HttpStatusCode.NotFound,"Function Not Found");

			methodInfo.Invoke(nativeHost, null);
		}
	}

	public class NativeHostAction : IReturnVoid
	{
		public string Action { get; set; }
	}

	public class NativeHost
	{
		public void ShowAbout()
		{
			//Invoke native about menu item programmatically.
			Program.MainMenu.InvokeOnMainThread (() => {
				foreach (var item in Program.MainMenu.ItemArray()) {
					if (item.Title == "Gistlyn") {
						item.Submenu.PerformActionForItem(0);
                        return;
					}
				}
			});
		}

		public void Quit()
		{
            Program.MainMenu.InvokeOnMainThread (() => {
                NSApplication.SharedApplication.Terminate(NSApplication.SharedApplication);
            });
		}
	}
}

