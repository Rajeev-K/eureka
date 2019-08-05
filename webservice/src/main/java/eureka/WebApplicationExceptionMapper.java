package eureka;
 
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

@Provider
public class WebApplicationExceptionMapper extends WebApplicationException implements ExceptionMapper<WebApplicationException>
{
    private static final long serialVersionUID = 1L;
  
    @Override
    public Response toResponse(WebApplicationException ex)
    {
        int status;
        if (ex instanceof BadRequestException)
            status = 400;
        else if (ex instanceof NotFoundException)
            status = 404;
        else
            status = 500;
        return Response.status(status).entity(errorMessageJson(ex.getMessage())).type("application/json").build();
    }

    private String errorMessageJson(String message) {
        return String.format("{\"message\": \"%s\", \"error\": true}", message);
    }    
}
