﻿using ServiceStack;

namespace Gistlyn.ServiceModel
{
    [Route("/packages/install")]
    public class InstallNugetPackage : IReturn<InstallNugetPackageResponse>
    {
        public string PackageId { get; set; }

        public string Version { get; set; }

        public bool AllowPrereleaseVersion { get; set; }
    }

    public class InstallNugetPackageResponse
    {
        public string Error { get; set; }
    }
}

