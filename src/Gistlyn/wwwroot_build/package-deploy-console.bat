@echo off
SET STAGING=staging-console

IF EXIST %STAGING%\ (
RMDIR /S /Q .\%STAGING%
) ELSE IF EXIST %STAGING% (
DEL /s %STAGING%
)

MD %STAGING%

SET TOOLS=.\tools
SET OUTPUTNAME=Gistlyn-console.exe
SET ILMERGE=%TOOLS%\ILMerge.exe
SET RELEASE=..\..\Gistlyn.AppConsole\bin\Release
SET INPUT=%RELEASE%\Gistlyn.AppConsole.exe
SET INPUT=%INPUT% %RELEASE%\Gistlyn.Resources.dll
SET INPUT=%INPUT% %RELEASE%\Gistlyn.ServiceInterface.dll
SET INPUT=%INPUT% %RELEASE%\Gistlyn.ServiceModel.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Text.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Client.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Common.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Interfaces.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Server.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.OrmLite.dll
SET INPUT=%INPUT% %RELEASE%\ServiceStack.Redis.dll

%ILMERGE% /target:exe /targetplatform:v4,"C:\Program Files (x86)\Reference Assemblies\Microsoft\Framework\.NETFramework\v4.5" /out:%STAGING%\%OUTPUTNAME% /ndebug %INPUT% 

IF NOT EXIST apps (
MD apps
)

COPY /Y .\%STAGING%\%OUTPUTNAME% .\apps\

echo ------------- && echo  deployed to: .\wwwroot_build\apps\%OUTPUTNAME% && echo -------------